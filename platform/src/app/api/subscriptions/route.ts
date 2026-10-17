import { getCurrentUser, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") {
    const authorized = await requireModuleApi("SUBSCRIPTIONS");
    if (authorized instanceof Response) return authorized;
  }
  const subscriptions = await prisma.subscription.findMany({
    where: user.role === "CUSTOMER" ? { organization: { members: { some: { userId: user.id } } } } : {},
    include: { plan: true, organization: { select: { id: true, name: true } }, history: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" }
  });
  return Response.json({ subscriptions });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return Response.json({ error: "Trial boshlash uchun mijoz akkauntida kiring." }, { status: user ? 403 : 401 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Tashkilot, reja va trial roziligi talab qilinadi." }, { status: 400 });

  const membership = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: parsed.data.organizationId } },
    select: { role: true }
  });
  if (!membership || !["OWNER", "ADMINISTRATOR", "FINANCE"].includes(membership.role)) {
    return Response.json({ error: "Ushbu tashkilot uchun obuna boshlash huquqi yo‘q." }, { status: 403 });
  }
  try {
    const subscription = await prisma.$transaction(async (tx) => {
      const plan = await tx.subscriptionPlan.findFirst({ where: { id: parsed.data.planId, active: true } });
      if (!plan) throw new Error("ACTIVE_PLAN_NOT_FOUND");
      if (plan.trialDays < 1) throw new Error("TRIAL_NOT_AVAILABLE");
      const existing = await tx.subscription.findFirst({
        where: { organizationId: parsed.data.organizationId, status: { in: ["TRIAL_ACTIVE", "ACTIVE", "PAST_DUE", "SUSPENDED"] } },
        select: { id: true }
      });
      if (existing) throw new Error("SUBSCRIPTION_ALREADY_EXISTS");
      const now = new Date();
      const created = await tx.subscription.create({
        data: {
          organizationId: parsed.data.organizationId,
          planId: plan.id,
          status: "TRIAL_ACTIVE",
          trialEndsAt: new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000),
          consentAt: now,
          history: { create: { fromStatus: "NOT_ENROLLED", toStatus: "TRIAL_ACTIVE", actorId: user.id } }
        },
        include: { plan: true, organization: { select: { name: true } } }
      });
      await tx.auditLog.create({ data: { actorId: user.id, action: "MONITORING_TRIAL_STARTED", entity: "Subscription", entityId: created.id } });
      return created;
    });
    return Response.json({ subscription }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ACTIVE_PLAN_NOT_FOUND") return Response.json({ error: "Tanlangan obuna rejasi mavjud emas." }, { status: 404 });
    if (error instanceof Error && error.message === "SUBSCRIPTION_ALREADY_EXISTS") return Response.json({ error: "Tashkilotda faol yoki kutilayotgan obuna allaqachon mavjud." }, { status: 409 });
    if (error instanceof Error && error.message === "TRIAL_NOT_AVAILABLE") return Response.json({ error: "Ushbu reja uchun onlayn trial ochilmagan. Tecsecure bilan bog‘laning." }, { status: 409 });
    console.error("Subscription enrollment failed", error);
    return Response.json({ error: "Trial boshlanmadi." }, { status: 500 });
  }
}
