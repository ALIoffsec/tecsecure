import { getCurrentUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";

export async function getActivePlanKey(userId: string): Promise<string | null> {
  const now = new Date();
  const subscription = await prisma.learningSubscription.findFirst({
    where: { userId, startsAt: { lte: now }, endsAt: { gt: now } },
    select: { planKey: true }
  });
  return subscription?.planKey ?? null;
}

export async function requirePracticeUser() {
  if (isPreviewMode) return { error: Response.json({ error: "Amaliyot bo‘limi hozircha yoqilmagan." }, { status: 503 }) } as const;
  const user = await getCurrentUser();
  if (!user) return { error: Response.json({ error: "Kirish talab qilinadi." }, { status: 401 }) } as const;
  if (user.role !== "CUSTOMER") return { error: Response.json({ error: "Bu bo‘lim faqat mijoz hisobi uchun." }, { status: 403 }) } as const;
  return { user } as const;
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export const labPurchaseKey = (slug: string) => `lab:${slug}`;
export const examPurchaseKey = (slug: string) => `exam:${slug}`;
