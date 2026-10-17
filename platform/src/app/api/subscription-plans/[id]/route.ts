import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionPlanSchema } from "@/lib/validation";
import { z } from "zod";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

const updateSchema = subscriptionPlanSchema.partial().extend({
  active: z.boolean().optional()
}).refine((value) => Object.keys(value).length > 0);

export async function PATCH(request: Request, context: Context) {
  const actor = await requireModuleApi("SUBSCRIPTIONS");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Obuna rejasi ma’lumotlari noto‘g‘ri." }, { status: 400 });
  const { id } = await context.params;

  try {
    const plan = await prisma.$transaction(async (tx) => {
      const updated = await tx.subscriptionPlan.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: parsed.data.active === false ? "SUBSCRIPTION_PLAN_ARCHIVED" : "SUBSCRIPTION_PLAN_UPDATED",
          entity: "SubscriptionPlan",
          entityId: id
        }
      });
      return updated;
    });
    return Response.json({ plan });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return Response.json({ error: "Obuna rejasi topilmadi." }, { status: 404 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bunday nomdagi obuna rejasi mavjud." }, { status: 409 });
    }
    console.error("Subscription plan update failed", error);
    return Response.json({ error: "Obuna rejasini yangilab bo‘lmadi." }, { status: 500 });
  }
}
