import { LearningCatalog } from "@/components/learning-catalog";
import { pageMetadata } from "@/lib/structured-data";

export const metadata = pageMetadata({
  path: "/learning/modules",
  title: "Barcha IT va kiberxavfsizlik kurslari",
  description: "Linux, tarmoq, Windows, MikroTik, Cisco, SOC, veb-xavfsizlik va boshqa yo‘nalishdagi kurslar: darajasi, davomiyligi va amaliy laboratoriyalari bilan."
});

export default function LearningModulesPage() {
  return <LearningCatalog section="modules" />;
}
