import { PracticeHubPage } from "@/components/practice-hub-page";
import { pageMetadata } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/learning/practice",
  title: "Amaliyot: laboratoriyalar, imtihonlar va CTF",
  description: "Terminal laboratoriyalari, imtihonlar va CTF mashqlari orqali kurslarda o‘rganganingizni amalda mustahkamlang."
});

export default function PracticePage() {
  return <PracticeHubPage view="overview" />;
}
