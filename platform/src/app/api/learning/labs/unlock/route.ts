import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getLab } from "@/lib/learning-labs";
import { labPriceFor } from "@/lib/practice-perks";
import { getActivePlanKey, labPurchaseKey, readJson, requirePracticeUser } from "@/lib/practice-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({ slug: z.string().min(1).max(100) });

export async function POST(request: Request) {
  const auth = await requirePracticeUser();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ error: "So‘rovni tekshiring." }, { status: 400 });
  const lab = getLab(parsed.data.slug);
  if (!lab) return Response.json({ error: "Laboratoriya topilmadi." }, { status: 404 });
  const userId = auth.user.id;
  const key = labPurchaseKey(lab.slug);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.learningPurchase.findUnique({ where: { userId_purchaseKey: { userId, purchaseKey: key } } });
      const account = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { rewardPoints: true } });
      if (existing) return { unlocked: true, charged: 0, tecBalance: account.rewardPoints };
      const planKey = await getActivePlanKey(userId);
      const price = labPriceFor(planKey, lab.priceTec);
      if (price > 0) {
        const debit = await tx.user.updateMany({
          where: { id: userId, rewardPoints: { gte: price } },
          data: { rewardPoints: { decrement: price } }
        });
        if (debit.count !== 1) throw new Error("TEC_BALANCE_TOO_LOW");
      }
      const purchase = await tx.learningPurchase.create({
        data: { userId, moduleSlug: key, sectionIndex: null, purchaseKey: key, priceTec: price }
      });
      await tx.auditLog.create({ data: { actorId: userId, action: "LEARNING_LAB_UNLOCKED", entity: "LearningPurchase", entityId: purchase.id } });
      const after = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { rewardPoints: true } });
      return { unlocked: true, charged: price, tecBalance: after.rewardPoints };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return Response.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "TEC_BALANCE_TOO_LOW") {
      return Response.json({ error: "TEC balansingiz yetarli emas." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2002" || error.code === "P2034")) {
      return Response.json({ error: "Holat yangilandi. Qayta urinib ko‘ring." }, { status: 409 });
    }
    console.error("Lab unlock failed", error);
    return Response.json({ error: "Laboratoriyani ochib bo‘lmadi." }, { status: 500 });
  }
}
