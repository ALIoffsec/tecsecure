import { getCurrentUser, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const schema = z.object({ status: z.enum(["ACTIVE", "PAST_DUE", "SUSPENDED", "CANCELLED"]) });

export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") {
    const authorized = await requireModuleApi("SUBSCRIPTIONS");
    if (authorized instanceof Response) return authorized;
  }
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Obuna holati noto‘g‘ri." }, { status: 400 });
  const { id } = await context.params;
  const admin = user.role === "ADMIN" || user.role === "FOUNDER" || user.role === "STAFF";
  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.subscription.findUnique({ where: { id } });
      if (!current) return { error: "Obuna topilmadi.", status: 404 as const };
      if (!admin) {
        const member = await tx.organizationMember.findUnique({
          where: { userId_organizationId: { userId: user.id, organizationId: current.organizationId } },
          select: { role: true }
        });
        if (!member || !["OWNER", "ADMINISTRATOR", "FINANCE"].includes(member.role)) {
          return { error: "Obunani boshqarishga ruxsat yo‘q.", status: 403 as const };
        }
        if (parsed.data.status !== "CANCELLED") return { error: "Mijoz obunani faqat bekor qilishi mumkin.", status: 403 as const };
      }
      const allowed: Record<string, string[]> = {
        NOT_ENROLLED: ["TRIAL_ACTIVE", "CANCELLED"],
        TRIAL_ACTIVE: ["ACTIVE", "PAST_DUE", "CANCELLED"],
        ACTIVE: ["PAST_DUE", "SUSPENDED", "CANCELLED"],
        PAST_DUE: ["ACTIVE", "SUSPENDED", "CANCELLED"],
        SUSPENDED: ["ACTIVE", "CANCELLED"],
        CANCELLED: []
      };
      if (!allowed[current.status].includes(parsed.data.status)) {
        return { error: `Obuna ${current.status} holatidan ${parsed.data.status} holatiga o‘ta olmaydi.`, status: 409 as const };
      }
      const updated = await tx.subscription.update({ where: { id }, data: { status: parsed.data.status } });
      await tx.subscriptionEvent.create({
        data: { subscriptionId: id, fromStatus: current.status, toStatus: parsed.data.status, actorId: user.id }
      });
      await tx.auditLog.create({ data: { actorId: user.id, action: `SUBSCRIPTION_${parsed.data.status}`, entity: "Subscription", entityId: id } });
      return { subscription: updated };
    });
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
    return Response.json({ subscription: result.subscription });
  } catch (error) {
    console.error("Subscription status update failed", error);
    return Response.json({ error: "Obuna holatini yangilab bo‘lmadi." }, { status: 500 });
  }
}
