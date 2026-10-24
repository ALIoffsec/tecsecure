import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectRequestForm } from "@/components/project-request-form";
import { ServiceRequestForm } from "@/components/service-request-form";
import { AccountSessionActions } from "@/components/account-session-actions";
import { LocalizedText } from "@/components/site-preferences";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function RequestQuotePage() {
  if (isPreviewMode) return <div className="container page-shell"><h1 className="page-title"><LocalizedText id="requestProjectPriceTitle" /></h1><PreviewModeNotice /></div>;
  const user = await getCurrentUser();
  if (user && user.role !== "CUSTOMER") {
    return <div className="container page-shell"><h1 className="page-title"><LocalizedText id="requestProjectPriceTitle" /></h1><p className="page-intro"><LocalizedText id="signOutToRequestQuote" /></p><AccountSessionActions /></div>;
  }
  const services = await prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { id: true, name: true } });
  if (!user) {
    return <div className="container page-shell">
      <span className="eyebrow"><LocalizedText id="projectCart" /></span>
      <h1 className="page-title"><LocalizedText id="requestProjectPriceTitle" /></h1>
      <p className="page-intro"><LocalizedText id="guestQuoteDescription" /></p>
      <div style={{ maxWidth: 720 }}><ServiceRequestForm services={services} showRegisterLink /></div>
    </div>;
  }
  const products = await prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true } });
  const catalog = [
    ...products.map((item) => ({ ...item, kind: "product" as const })),
    ...services.map((item) => ({ ...item, kind: "service" as const }))
  ];
  return <div className="container page-shell"><span className="eyebrow"><LocalizedText id="projectCart" /></span><h1 className="page-title"><LocalizedText id="requestProjectPriceTitle" /></h1><p className="page-intro"><LocalizedText id="projectQuoteDescription" /></p><div style={{ maxWidth: 720 }}><ProjectRequestForm catalog={catalog} /></div></div>;
}
