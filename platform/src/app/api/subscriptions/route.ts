import { getCurrentUser, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionSchema } from "@/lib/validation";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { trialAllowed } from "@/lib/monitoring-rules";

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

/**
 * A monitoring trial is opened by staff after talking to the customer (the customer asks with "Obuna so‘rash").
 * One trial per organisation, ever: an earlier trial, even cancelled, blocks a second one.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role === "CUSTOMER") return Response.json({ error: "Sinovni xodim ochadi: “Obuna so‘rash” orqali yozing.", code: "TRIAL_BY_STAFF" }, { status: 403 });
  const actor = await requireModuleApi("SUBSCRIPTIONS");
  if (actor instanceof Response) return actor;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Tashkilot, reja va mijoz roziligi talab qilinadi." }, { status: 400 });
  const limited = await rateLimit("subscription-create", actor.id, 30, 60 * 60 * 1000);
  if (!limited.ok) return tooManyAttempts(limited.retryAfterSeconds);
  try {
    const subscription = await prisma.$transaction(async (tx) => {
      // The organisation row serialises trial starts, so two staff cannot both open one.
      await tx.$queryRaw`SELECT id FROM "Organization" WHERE id = ${parsed.data.organizationId} FOR UPDATE`;
      const plan = await tx.subscriptionPlan.findFirst({ where: { id: parsed.data.planId, active: true } });
      if (!plan) throw new Error("ACTIVE_PLAN_NOT_FOUND");
      if (plan.trialDays < 1) throw new Error("TRIAL_NOT_AVAILABLE");
      const [live, trials] = await Promise.all([
        tx.subscription.count({ where: { organizationId: parsed.data.organizationId, status: { in: ["TRIAL_ACTIVE", "ACTIVE", "PAST_DUE", "SUSPENDED"] } } }),
        tx.subscription.count({ where: { organizationId: parsed.data.organizationId, trialEndsAt: { not: null } } })
      ]);
      if (live > 0) throw new Error("SUBSCRIPTION_ALREADY_EXISTS");
      if (!trialAllowed(trials)) throw new Error("TRIAL_USED");
      const now = new Date();
      const created = await tx.subscription.create({
        data: {
          organizationId: parsed.data.organizationId,
          planId: plan.id,
          status: "TRIAL_ACTIVE",
          trialEndsAt: new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000),
          consentAt: now,
          history: { create: { fromStatus: "NOT_ENROLLED", toStatus: "TRIAL_ACTIVE", actorId: actor.id } }
        },
        include: { plan: true, organization: { select: { name: true } } }
      });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "MONITORING_TRIAL_STARTED", entity: "Subscription", entityId: created.id } });
      return created;
    });
    return Response.json({ subscription }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ACTIVE_PLAN_NOT_FOUND") return Response.json({ error: "Tanlangan obuna rejasi mavjud emas." }, { status: 404 });
    if (error instanceof Error && error.message === "SUBSCRIPTION_ALREADY_EXISTS") return Response.json({ error: "Tashkilotda faol yoki kutilayotgan obuna allaqachon mavjud." }, { status: 409 });
    if (error instanceof Error && error.message === "TRIAL_USED") return Response.json({ error: "Bu tashkilot sinov davridan allaqachon foydalangan." }, { status: 409 });
    if (error instanceof Error && error.message === "TRIAL_NOT_AVAILABLE") return Response.json({ error: "Ushbu reja uchun sinov ochilmagan." }, { status: 409 });
    console.error("Subscription enrollment failed", error);
    return Response.json({ error: "Sinov boshlanmadi." }, { status: 500 });
  }
}
