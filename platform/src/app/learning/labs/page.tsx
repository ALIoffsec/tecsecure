import { LearningCatalog } from "@/components/learning-catalog";
import { PracticeHubPage } from "@/components/practice-hub-page";
import { LabsFilter } from "@/components/labs-filter";
import { getVulNyxMachineCatalog } from "@/lib/vulnyx-catalog";
import { pageMetadata } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/learning/labs",
  title: "Laboratoriyalar: lab vazifalari, amaliyot va CTF",
  description: "Kurslarga bog‘langan terminal laboratoriyalari, amaliyot va CTF mashinalari bir joyda."
});

/** Labs, practice and CTF in one section, chosen with a filter; their own addresses keep working too. */
export default async function LearningLabsPage({ searchParams }: { searchParams?: Promise<{ tur?: string | string[]; module?: string | string[] }> }) {
  const params = await searchParams;
  const raw = Array.isArray(params?.tur) ? params?.tur[0] : params?.tur;
  const view = raw === "practice" || raw === "ctf" ? raw : "labs";
  const moduleValue = params?.module;
  const moduleSlug = Array.isArray(moduleValue) ? moduleValue[0] : moduleValue;
  return <>
    <LabsFilter current={view} />
    {view === "labs" && <PracticeHubPage view="labs" moduleSlug={moduleSlug} />}
    {view === "practice" && <PracticeHubPage view="overview" />}
    {view === "ctf" && <LearningCatalog section="ctf" vulnyx={await getVulNyxMachineCatalog()} />}
  </>;
}
