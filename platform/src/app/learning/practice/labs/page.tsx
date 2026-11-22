import { PracticeHubPage } from "@/components/practice-hub-page";
import { pageMetadata } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/learning/practice/labs",
  title: "Amaliy laboratoriyalar",
  description: "Kurslarga bog‘langan terminal laboratoriyalari: vazifalar soni, davomiyligi va darajasi bilan."
});

export default async function PracticeLabsPage({ searchParams }: {
  searchParams?: Promise<{ module?: string | string[] }>;
}) {
  const params = await searchParams;
  const moduleValue = params?.module;
  const moduleSlug = Array.isArray(moduleValue) ? moduleValue[0] : moduleValue;
  return <PracticeHubPage view="labs" moduleSlug={moduleSlug} />;
}
