import { notFound } from "next/navigation";
import { LearningPathView } from "@/components/learning-path-view";
import { getPath } from "@/lib/learning-demo";

export default async function LearningPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const path = getPath((await params).slug);
  if (!path) notFound();
  return <LearningPathView path={path} />;
}
