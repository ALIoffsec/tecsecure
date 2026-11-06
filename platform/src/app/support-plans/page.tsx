import { SupportPlansView } from "@/components/growth-pages";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Oylik IT yordam | Tecsecure", description: "Doimiy IT xodim o‘rniga oylik xizmat: tarmoq, kompyuter, server va xavfsizlik nazorati.", alternates: { canonical: "/support-plans" } };

export default async function SupportPlansPage() {
  const plans = isPreviewMode ? [] : await prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  return <SupportPlansView plans={plans.map(plan => ({ id: plan.id, name: plan.name, interval: plan.interval, priceMinor: plan.priceMinor, currency: plan.currency, features: Array.isArray(plan.features) ? plan.features.filter((item): item is string => typeof item === "string") : [] }))} />;
}
