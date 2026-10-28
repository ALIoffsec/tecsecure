import { PracticeHubPage } from "@/components/practice-hub-page";

export const dynamic = "force-dynamic";

export default async function PracticeLabsPage({ searchParams }: {
  searchParams?: Promise<{ module?: string | string[] }>;
}) {
  const params = await searchParams;
  const moduleValue = params?.module;
  const moduleSlug = Array.isArray(moduleValue) ? moduleValue[0] : moduleValue;
  return <PracticeHubPage view="labs" moduleSlug={moduleSlug} />;
}
