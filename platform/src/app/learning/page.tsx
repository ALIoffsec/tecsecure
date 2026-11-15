import { LearningCatalog } from "@/components/learning-catalog";
import { pageMetadata } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/learning",
  title: "IT va kiberxavfsizlik kurslari — amaliy ta’lim",
  description: "Linux, tarmoq va kiberxavfsizlik bo‘yicha amaliy kurslar: darslar, laboratoriyalar, imtihonlar va CTF mashqlari. O‘zbek tilida, o‘z tezligingizda."
});

export default async function LearningPage() {
  return <LearningCatalog section="overview" />;
}
