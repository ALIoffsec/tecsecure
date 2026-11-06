import type { Metadata } from "next";
import { SeoLanding, seoMetadata } from "@/components/seo-landing";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return seoMetadata("ru", (await params).slug);
}

export default async function RussianServicePage({ params }: Props) {
  return <SeoLanding language="ru" slug={(await params).slug} />;
}
