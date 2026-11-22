import { PracticeHubPage } from "@/components/practice-hub-page";
import { pageMetadata } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/learning/practice/exams",
  title: "Imtihon topshirish",
  description: "Kurslar bo‘yicha imtihonlar: savollar soni, vaqti va o‘tish bali. Natijangizni o‘quv kabinetida kuzating."
});

export default function PracticeExamsPage() {
  return <PracticeHubPage view="exams" />;
}
