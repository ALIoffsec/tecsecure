import type { Metadata } from "next";
import { SeoLanding, seoMetadata } from "@/components/seo-landing";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return seoMetadata("uz", (await params).slug);
}

export default async function UzbekServicePage({ params }: Props) {
  return <SeoLanding language="uz" slug={(await params).slug} />;
}
