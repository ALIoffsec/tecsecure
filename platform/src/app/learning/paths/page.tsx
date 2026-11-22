import { LearningCatalog } from "@/components/learning-catalog";
import { pageMetadata } from "@/lib/structured-data";

export const metadata = pageMetadata({
  path: "/learning/paths",
  title: "O‘quv yo‘llari: kasb va ko‘nikma bo‘yicha",
  description: "IT support, tarmoq administratori, SOC tahlilchisi kabi kasblar uchun kurslarni qaysi tartibda o‘tishni ko‘rsatadigan o‘quv rejalari."
});

export default function LearningPathsPage() {
  return <LearningCatalog section="paths" />;
}
