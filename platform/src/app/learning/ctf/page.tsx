import { LearningCatalog } from "@/components/learning-catalog";
import { getVulNyxMachineCatalog } from "@/lib/vulnyx-catalog";
import { pageMetadata } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/learning/ctf",
  title: "CTF mashqlari: amaliy kiberxavfsizlik mashinalari",
  description: "Kiberxavfsizlik bo‘yicha amaliy CTF mashinalari ro‘yxati: operatsion tizimi, qiyinlik darajasi va yuklab olish havolasi bilan."
});

export default async function LearningCtfPage() {
  const vulnyx = await getVulNyxMachineCatalog();
  return <LearningCatalog section="ctf" vulnyx={vulnyx} />;
}
