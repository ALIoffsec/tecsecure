import { LearningCatalog } from "@/components/learning-catalog";
import { getVulNyxMachineCatalog } from "@/lib/vulnyx-catalog";

export const dynamic = "force-dynamic";

export default async function LearningCtfPage() {
  const vulnyx = await getVulNyxMachineCatalog();
  return <LearningCatalog section="ctf" vulnyx={vulnyx} />;
}
