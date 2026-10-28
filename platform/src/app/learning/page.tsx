import { redirect } from "next/navigation";
import { LearningCatalog } from "@/components/learning-catalog";
import { getCurrentUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function LearningPage() {
  if (!isPreviewMode && !(await getCurrentUser())) redirect("/login?next=%2Flearning");
  return <LearningCatalog section="overview" />;
}
