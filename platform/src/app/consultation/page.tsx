import { ServiceRequestForm } from "@/components/service-request-form";
import { prisma } from "@/lib/prisma";
import { LocalizedText } from "@/components/site-preferences";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function ConsultationPage() {
  const services = isPreviewMode ? [] : await prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { id: true, name: true } });
  return <div className="container page-shell"><span className="eyebrow"><LocalizedText id="consultation" /></span><h1 className="page-title"><LocalizedText id="discussTechnicalNeeds" /></h1><p className="page-intro"><LocalizedText id="consultationDisclaimer" /></p><div style={{ maxWidth: 760 }}>{isPreviewMode ? <PreviewModeNotice /> : <ServiceRequestForm services={services} />}</div></div>;
}
