import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkStoryView } from "@/components/growth-pages";
import { prisma } from "@/lib/prisma";
import { catalogMedia } from "@/lib/catalog-media";
import { coverMedia } from "@/lib/catalog-utils";
import { pageMetadata, snippet } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };
const findPost = (slug: string) => prisma.portfolioPost.findFirst({ where: { slug, published: true } });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findPost((await params).slug);
  if (!post) return { title: "Loyiha topilmadi", robots: { index: false } };
  // The project's own photo is the share card when it has one.
  const cover = coverMedia((await catalogMedia([post]))(post.media));
  return pageMetadata({ path: `/work/${post.slug}`, title: post.title, description: snippet(post.description), image: cover?.mimeType.startsWith("image/") ? `/api/media/${cover.id}` : null });
}

export default async function WorkStoryPage({ params }: Props) {
  const post = await findPost((await params).slug);
  if (!post) notFound();
  return <WorkStoryView post={post} />;
}
