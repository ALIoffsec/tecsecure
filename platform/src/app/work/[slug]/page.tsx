import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkStoryView } from "@/components/growth-pages";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };
const findPost = (slug: string) => prisma.portfolioPost.findFirst({ where: { slug, published: true } });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findPost((await params).slug);
  if (!post) return {};
  return { title: `${post.title} | Tecsecure`, description: post.description.slice(0, 160), alternates: { canonical: `/work/${post.slug}` } };
}

export default async function WorkStoryPage({ params }: Props) {
  const post = await findPost((await params).slug);
  if (!post) notFound();
  return <WorkStoryView post={post} />;
}
