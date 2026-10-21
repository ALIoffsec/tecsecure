import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { learningSubscriptionPlans, getLearningSubscriptionPlan } from "@/lib/learning-subscriptions";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const purchaseSchema = z.object({ planKey: z.enum(["basic", "standard", "expert"]) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (isPreviewMode) return Response.json({ error: "O‘quv obunalari preview rejimida mavjud emas." }, { status: 503 });

  const subscription = await prisma.learningSubscription.findUnique({
    where: { userId: user.id },
    select: { planKey: true, startsAt: true, endsAt: true }
  });
  return Response.json({
    plans: learningSubscriptionPlans,
    subscription: subscription ? { ...subscription, active: subscription.startsAt <= new Date() && subscription.endsAt > new Date() } : null
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (isPreviewMode) return Response.json({ error: "O‘quv obunalari preview rejimida mavjud emas." }, { status: 503 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Obuna xarid qilish uchun tizimga kiring." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "O‘quv obunasini faqat mijoz hisobi xarid qilishi mumkin." }, { status: 403 });

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = purchaseSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Obuna rejasini tanlang." }, { status: 400 });

  const plan = getLearningSubscriptionPlan(parsed.data.planKey);
  if (!plan) return Response.json({ error: "Obuna rejasi topilmadi." }, { status: 400 });
  const now = new Date();
  try {
    const result = await prisma.$transaction(async (tx) => {
      const debit = await tx.user.updateMany({
        where: { id: user.id, walletBalanceMinor: { gte: plan.priceMinor } },
        data: { walletBalanceMinor: { decrement: plan.priceMinor } }
      });
      if (debit.count !== 1) throw new Error("LEARNING_WALLET_BALANCE_TOO_LOW");

      const previous = await tx.learningSubscription.findUnique({ where: { userId: user.id } });
      const startsAt = previous && previous.endsAt > now && previous.startsAt <= now ? previous.startsAt : now;
      const baseEnd = previous && previous.endsAt > now ? previous.endsAt : now;
      const endsAt = new Date(baseEnd.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
      const subscription = await tx.learningSubscription.upsert({
        where: { userId: user.id },
        create: { userId: user.id, planKey: plan.key, startsAt, endsAt },
        update: { planKey: plan.key, startsAt, endsAt }
      });
      const transaction = await tx.walletTransaction.create({
        data: {
          userId: user.id,
          kind: "LEARNING_SUBSCRIPTION",
          status: "APPROVED",
          amountMinor: plan.priceMinor,
          details: `Tecsecure Academy ${plan.name}: 30 kunlik obuna; avtomatik yangilanish yo‘q.`
        }
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "LEARNING_SUBSCRIPTION_PURCHASED",
          entity: "LearningSubscription",
          entityId: subscription.id
        }
      });
      const account = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { walletBalanceMinor: true }
      });
      return { account, subscription, transaction };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "LEARNING_WALLET_BALANCE_TOO_LOW") {
      return Response.json({ error: "Obuna uchun hamyoningizdagi UZS mablag‘i yetarli emas." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return Response.json({ error: "Hamyon yoki obuna holati o‘zgardi. Xaridni qayta urinib ko‘ring." }, { status: 409 });
    }
    console.error("Learning subscription purchase failed", error);
    return Response.json({ error: "O‘quv obunasini faollashtirib bo‘lmadi." }, { status: 500 });
  }
}
