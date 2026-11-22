import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearningPathView } from "@/components/learning-path-view";
import { getLearningPath } from "@/lib/learning-content";
import { pageMetadata, snippet } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = await getLearningPath((await params).slug);
  if (!path) return { title: "O‘quv yo‘li topilmadi", robots: { index: false } };
  return pageMetadata({
    path: `/learning/paths/${path.slug}`,
    title: `${path.title.uz} — o‘quv yo‘li`,
    description: snippet(path.summary.uz)
  });
}

export default async function LearningPathPage({ params }: Props) {
  const path = await getLearningPath((await params).slug);
  if (!path) notFound();
  return <LearningPathView path={path} />;
}
