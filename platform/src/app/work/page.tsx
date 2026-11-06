import { WorkPageView } from "@/components/work-page-view";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const posts = isPreviewMode ? [] : await prisma.portfolioPost.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" } });
  return <WorkPageView posts={posts} />;
}
