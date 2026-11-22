import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LocalizedText } from "@/components/site-preferences";
import { MediaGallery } from "@/components/media-uploader";
import { isPreviewMode } from "@/lib/preview-mode";
import { formatNumber } from "@/lib/format";
import { catalogMedia } from "@/lib/catalog-media";
import { coverMedia } from "@/lib/catalog-utils";
import { defaultContact } from "@/lib/site-contact";
import { siteOrigin } from "@/lib/site-origin";
import { businessAddress, jsonLd, pageMetadata, snippet } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/** One read per request for both the metadata and the page. */
const publishedService = cache(async (slug: string) => {
  if (isPreviewMode) return null;
  const service = await prisma.service.findFirst({ where: { slug, status: "PUBLISHED", availability: true } });
  if (!service) return null;
  const cover = coverMedia((await catalogMedia([service]))(service.media));
  return { service, image: cover?.mimeType.startsWith("image/") ? `/api/media/${cover.id}` : null };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await publishedService((await params).slug);
  if (!found) return { title: "Xizmat topilmadi", robots: { index: false } };
  return pageMetadata({ path: `/services/${found.service.slug}`, title: found.service.name, description: snippet(found.service.description), image: found.image });
}

export default async function ServiceDetailPage({ params }: Props) {
  const found = await publishedService((await params).slug);
  if (!found) notFound();
  const { service, image } = found;
  const origin = siteOrigin();
  // The same business details as the service landing pages (/xizmat), so search sees one provider.
  const structured = {
    "@context": "https://schema.org", "@type": "Service", name: service.name, description: snippet(service.description, 300), url: `${origin}/services/${service.slug}`,
    ...(image ? { image: `${origin}${image}` } : {}),
    areaServed: { "@type": "City", name: "Toshkent" },
    provider: { "@type": "LocalBusiness", name: "Tecsecure", url: origin, telephone: defaultContact.phone, address: businessAddress("uz") }
  };
  return <div className="container page-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
    <span className="eyebrow"><LocalizedText id="service" /></span>
    <h1 className="page-title">{service.name}</h1>
    <p className="page-intro">{service.description}</p>
    <MediaGallery media={service.media} title={service.name} />
    <div className="panel-card" style={{ maxWidth: 760 }}>
      <p><LocalizedText id="pricingModel" />: {service.pricingType === "QUOTE" ? <LocalizedText id="technicalProposal" /> : service.pricingType}</p>
      {service.startingPriceMinor !== null && <p><LocalizedText id="startingPrice" />: {formatNumber(service.startingPriceMinor / 100)} {service.currency}</p>}
      <p className="muted"><LocalizedText id="finalScopePrice" /></p>
      <Link className="button" href="/request-service"><LocalizedText id="requestThisService" /></Link>
    </div>
  </div>;
}
