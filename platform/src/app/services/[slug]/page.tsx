import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LocalizedText } from "@/components/site-preferences";
import { MediaGallery } from "@/components/media-uploader";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  if (isPreviewMode) notFound();
  const { slug } = await params;
  const service = await prisma.service.findFirst({ where: { slug, status: "PUBLISHED", availability: true } });
  if (!service) notFound();
  return <div className="container page-shell">
    <span className="eyebrow"><LocalizedText id="service" /></span>
    <h1 className="page-title">{service.name}</h1>
    <p className="page-intro">{service.description}</p>
    <MediaGallery media={service.media} title={service.name} />
    <div className="panel-card" style={{ maxWidth: 760 }}>
      <p><LocalizedText id="pricingModel" />: {service.pricingType === "QUOTE" ? <LocalizedText id="technicalProposal" /> : service.pricingType}</p>
      {service.startingPriceMinor !== null && <p><LocalizedText id="startingPrice" />: {(service.startingPriceMinor / 100).toLocaleString("uz-UZ")} {service.currency}</p>}
      <p className="muted"><LocalizedText id="finalScopePrice" /></p>
      <Link className="button" href="/request-service"><LocalizedText id="requestThisService" /></Link>
    </div>
  </div>;
}
