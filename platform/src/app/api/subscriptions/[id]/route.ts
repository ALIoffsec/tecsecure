import { getCurrentUser, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { LIVE_SUBSCRIPTION_STATUSES, cancelStopsMonitoring, subscriptionMoveAllowed } from "@/lib/monitoring-rules";

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
      if (!subscriptionMoveAllowed(current.status, parsed.data.status)) return { error: "Obunani bu holatga o‘tkazib bo‘lmaydi.", status: 409 as const };
      // Two people at once: only the first move from this status counts.
      const claim = await tx.subscription.updateMany({ where: { id, status: current.status }, data: { status: parsed.data.status } });
      if (claim.count === 0) return { error: "Obuna holati allaqachon o‘zgargan. Sahifani yangilang.", status: 409 as const };
      await tx.subscriptionEvent.create({ data: { subscriptionId: id, fromStatus: current.status, toStatus: parsed.data.status, actorId: user.id } });
      await tx.auditLog.create({ data: { actorId: user.id, action: `SUBSCRIPTION_${parsed.data.status}`, entity: "Subscription", entityId: id } });
      // A cancelled subscription stops the organisation's device checks, unless another one still covers them.
      const otherLive = await tx.subscription.count({ where: { organizationId: current.organizationId, id: { not: id }, status: { in: [...LIVE_SUBSCRIPTION_STATUSES] } } });
      if (cancelStopsMonitoring(parsed.data.status, otherLive)) {
        const stopped = await tx.device.updateMany({ where: { organizationId: current.organizationId, monitored: true }, data: { monitored: false, status: "UNKNOWN" } });
        await tx.auditLog.create({ data: { actorId: user.id, action: "MONITORING_STOPPED_BY_CANCEL", entity: "Organization", entityId: current.organizationId, metadata: { subscriptionId: id, devices: stopped.count } } });
      }
      return { subscription: await tx.subscription.findUniqueOrThrow({ where: { id } }) };
    });
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
    return Response.json({ subscription: result.subscription });
  } catch (error) {
    console.error("Subscription status update failed", error);
    return Response.json({ error: "Obuna holatini yangilab bo‘lmadi." }, { status: 500 });
  }
}
