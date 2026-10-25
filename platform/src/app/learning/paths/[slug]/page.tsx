import { notFound } from "next/navigation";
import { LearningPathView } from "@/components/learning-path-view";
import { getLearningPath } from "@/lib/learning-content";

export default async function LearningPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const path = await getLearningPath((await params).slug);
  if (!path) notFound();
  return <LearningPathView path={path} />;
}
