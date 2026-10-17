import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionPlanSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { name: "asc" }
  });
  return Response.json({ plans });
}

export async function POST(request: Request) {
  const actor = await requireModuleApi("SUBSCRIPTIONS");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = subscriptionPlanSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Obuna rejasi ma’lumotlari noto‘g‘ri." }, { status: 400 });
  try {
    const plan = await prisma.$transaction(async (tx) => {
      const created = await tx.subscriptionPlan.create({
        data: { ...parsed.data, features: parsed.data.features }
      });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "SUBSCRIPTION_PLAN_CREATED", entity: "SubscriptionPlan", entityId: created.id } });
      return created;
    });
    return Response.json({ plan }, { status: 201 });
  } catch (error) {
    console.error("Subscription plan creation failed", error);
    return Response.json({ error: "Obuna rejasini saqlab bo‘lmadi." }, { status: 500 });
  }
}
