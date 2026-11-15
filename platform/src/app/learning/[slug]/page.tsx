import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { LearningModuleView } from "@/components/learning-module-view";
import { getCurrentUser } from "@/lib/auth";
import { getLearningModule } from "@/lib/learning-content";
import { toLearningModulePreview } from "@/lib/learning-catalog-data";
import { siteOrigin } from "@/lib/site-origin";
import { courseLd, jsonLd, pageMetadata, snippet } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

/** The published course and how it is named for search: "bepul" only when it really costs nothing. */
const course = cache(async (slug: string) => {
  const module = await getLearningModule(slug);
  if (!module) return null;
  const preview = toLearningModulePreview(module);
  const free = preview.modulePriceTec === 0;
  return { module, preview, free, name: module.title.uz, description: snippet(module.summary.uz) };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await course((await params).slug);
  if (!found) return { title: "Kurs topilmadi", robots: { index: false } };
  return pageMetadata({
    path: `/learning/${found.module.slug}`,
    title: `${found.name} — ${found.free ? "bepul kurs" : "kurs"}`,
    description: found.description
  });
}

export default async function LearningModulePage({ params }: Props) {
  const { slug } = await params;
  const [found, user] = await Promise.all([course(slug), getCurrentUser()]);
  if (!found) notFound();
  const nickname = user?.name.trim() || user?.email.split("@")[0] || "student";
  const structured = courseLd({ origin: siteOrigin(), path: `/learning/${found.module.slug}`, name: found.name, description: found.description, free: found.free });
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
    <LearningModuleView module={found.preview} nickname={nickname} />
  </>;
}
