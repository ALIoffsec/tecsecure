import type { LearningModule } from "@/lib/learning-demo";
import type { Prisma } from "@prisma/client";

export type LearningPlanKey = "basic" | "standard" | "expert";

export const learningSubscriptionPlans: {
  key: LearningPlanKey;
  name: string;
  priceMinor: number;
  durationDays: 30;
  description: string;
  modules: string[] | "all";
}[] = [
  {
    key: "basic",
    name: "Basic",
    priceMinor: 4_990_000,
    durationDays: 30,
    description: "Asosiy tarmoq, Linux, Windows va kiberxavfsizlik darslari.",
    modules: ["network-fundamentals", "linux-fundamentals", "windows-fundamentals", "intro-cybersecurity"]
  },
  {
    key: "standard",
    name: "Standard",
    priceMinor: 9_990_000,
    durationDays: 30,
    description: "Asosiy bilimlar va amaliy o‘rta bosqich mavzulari.",
    modules: [
      "network-fundamentals", "linux-fundamentals", "windows-fundamentals", "intro-cybersecurity",
      "wifi-security", "mikrotik-routeros-basics", "active-directory-security", "soc-log-analysis"
    ]
  },
  {
    key: "expert",
    name: "Expert",
    priceMinor: 19_990_000,
    durationDays: 30,
    description: "Hozirgi katalogdagi barcha 13 modul. Bu senior malakasi yoki ish tajribasi kafolati emas.",
    modules: "all"
  }
];

export function getLearningSubscriptionPlan(key: string) {
  return learningSubscriptionPlans.find((plan) => plan.key === key);
}

export function planIncludesModule(planKey: string, moduleSlug: string): boolean {
  const plan = getLearningSubscriptionPlan(planKey);
  return Boolean(plan && (plan.modules === "all" || plan.modules.includes(moduleSlug)));
}

type LearningAccessDb = Pick<Prisma.TransactionClient, "learningPurchase" | "learningSubscription">;

export async function hasLearningModuleAccess(
  db: LearningAccessDb,
  userId: string,
  module: LearningModule,
  sectionIndex: number,
  now = new Date()
): Promise<boolean> {
  const subscription = await db.learningSubscription.findFirst({
    where: {
      userId,
      startsAt: { lte: now },
      endsAt: { gt: now },
      planKey: { in: ["basic", "standard", "expert"] }
    },
    select: { planKey: true }
  });
  if (subscription && planIncludesModule(subscription.planKey, module.slug)) return true;

  const existingPurchase = await db.learningPurchase.findFirst({
    where: {
      userId,
      moduleSlug: module.slug,
      OR: [{ sectionIndex }, { sectionIndex: null }]
    },
    select: { id: true }
  });
  return existingPurchase !== null;
}
