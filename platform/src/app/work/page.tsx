import { WorkPageView } from "@/components/work-page-view";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";
import { pageMetadata } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/work",
  title: "Bajarilgan ishlar",
  description: "Tecsecure bajargan loyihalar: videokuzatuv, tarmoq va IT infratuzilma ishlari — rasmlari va qisqa tavsifi bilan."
});

export default async function WorkPage() {
  const posts = isPreviewMode ? [] : await prisma.portfolioPost.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" } });
  return <WorkPageView posts={posts} />;
}
