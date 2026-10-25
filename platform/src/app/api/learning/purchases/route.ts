import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { getLearningModule } from "@/lib/learning-content";
import { modulePriceTec, sectionPriceTec, sectionPurchaseKey } from "@/lib/learning-pricing";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hasLearningModuleAccess, planIncludesModule } from "@/lib/learning-subscriptions";

export const runtime = "nodejs";

const purchaseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("MODULE"), moduleSlug: z.string().min(1).max(100) }),
  z.object({ kind: z.literal("SECTION"), moduleSlug: z.string().min(1).max(100), sectionIndex: z.number().int().nonnegative() })
]);

export async function GET(request: Request) {
  if (isPreviewMode) return Response.json({ error: "TEC xaridlari hozircha yoqilmagan." }, { status: 503 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const moduleSlug = new URL(request.url).searchParams.get("module");
  const [account, purchases, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { rewardPoints: true } }),
    prisma.learningPurchase.findMany({
      where: { userId: user.id, ...(moduleSlug ? { moduleSlug } : {}) },
      select: { moduleSlug: true, sectionIndex: true, purchaseKey: true, priceTec: true, createdAt: true },
      orderBy: { createdAt: "asc" }
    }),
    prisma.learningSubscription.findUnique({
      where: { userId: user.id },
      select: { planKey: true, startsAt: true, endsAt: true }
    })
  ]);
  if (!account) return Response.json({ error: "Foydalanuvchi hisobi topilmadi." }, { status: 404 });
  const subscriptionAccess = Boolean(
    moduleSlug &&
    subscription &&
    subscription.startsAt <= new Date() &&
    subscription.endsAt > new Date() &&
    planIncludesModule(subscription.planKey, moduleSlug)
  );
  return Response.json({ tecBalance: account.rewardPoints, purchases, subscriptionAccess });
}

export async function POST(request: Request) {
  if (isPreviewMode) return Response.json({ error: "TEC xaridlari hozircha yoqilmagan." }, { status: 503 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Xarid qilish uchun tizimga kiring." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "O‘quv modullarini faqat mijoz hisobi xarid qilishi mumkin." }, { status: 403 });

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = purchaseSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Xarid ma’lumotlarini tekshiring." }, { status: 400 });

  const module = await getLearningModule(parsed.data.moduleSlug);
  if (!module) return Response.json({ error: "O‘quv moduli topilmadi." }, { status: 404 });
  const sectionIndex = parsed.data.kind === "SECTION" ? parsed.data.sectionIndex : null;
  if (sectionIndex !== null && sectionIndex >= module.sections.length) {
    return Response.json({ error: "Dars bo‘limi topilmadi." }, { status: 404 });
  }
  const priceTec = sectionIndex === null ? modulePriceTec(module) : sectionPriceTec(module, sectionIndex);
  if (priceTec <= 0) return Response.json({ error: "Bu material bepul, xarid talab qilinmaydi." }, { status: 400 });

  const purchaseKey = sectionPurchaseKey(module.slug, sectionIndex);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const activeSubscription = await tx.learningSubscription.findFirst({
        where: { userId: user.id, startsAt: { lte: new Date() }, endsAt: { gt: new Date() } },
        select: { planKey: true }
      });
      if (activeSubscription && planIncludesModule(activeSubscription.planKey, module.slug)) {
        const account = await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { rewardPoints: true } });
        return { alreadyOwned: true, subscriptionAccess: true, tecBalance: account.rewardPoints, purchase: null };
      }
      if (sectionIndex !== null && await hasLearningModuleAccess(tx, user.id, module, sectionIndex)) {
        const account = await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { rewardPoints: true } });
        return { alreadyOwned: true, subscriptionAccess: false, tecBalance: account.rewardPoints, purchase: null };
      }
      const existing = await tx.learningPurchase.findMany({
        where: { userId: user.id, moduleSlug: module.slug },
        select: { purchaseKey: true, sectionIndex: true }
      });
      const alreadyOwnsModule = existing.some((item) => item.sectionIndex === null);
      const alreadyOwnsSection = sectionIndex !== null && existing.some((item) => item.sectionIndex === sectionIndex);
      const paidSections = module.sections
        .map((_, index) => index)
        .filter((index) => sectionPriceTec(module, index) > 0);
      const ownsAllSections = paidSections.every((index) =>
        existing.some((item) => item.sectionIndex === index)
      );
      if (alreadyOwnsModule || alreadyOwnsSection || (sectionIndex === null && ownsAllSections)) {
        const account = await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { rewardPoints: true } });
        return { alreadyOwned: true, subscriptionAccess: false, tecBalance: account.rewardPoints, purchase: null };
      }

      const debit = await tx.user.updateMany({
        where: { id: user.id, rewardPoints: { gte: priceTec } },
        data: { rewardPoints: { decrement: priceTec } }
      });
      if (debit.count !== 1) throw new Error("TEC_BALANCE_TOO_LOW");

      const purchase = await tx.learningPurchase.create({
        data: { userId: user.id, moduleSlug: module.slug, sectionIndex, purchaseKey, priceTec }
      });
      const account = await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { rewardPoints: true } });
      await tx.auditLog.create({
        data: { actorId: user.id, action: "LEARNING_CONTENT_PURCHASED", entity: "LearningPurchase", entityId: purchase.id }
      });
      return { alreadyOwned: false, subscriptionAccess: false, tecBalance: account.rewardPoints, purchase };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return Response.json(result, { status: result.alreadyOwned ? 200 : 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "TEC_BALANCE_TOO_LOW") {
      return Response.json({ error: "TEC balansingiz yetarli emas." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu material avval ochilgan. Sahifani yangilang." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return Response.json({ error: "Balans yangilandi. Xaridni qayta urinib ko‘ring." }, { status: 409 });
    }
    console.error("Learning content purchase failed", error);
    return Response.json({ error: "O‘quv materiali xaridini yakunlab bo‘lmadi." }, { status: 500 });
  }
}
