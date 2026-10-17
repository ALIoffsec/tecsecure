import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectRequestForm } from "@/components/project-request-form";
import { LocalizedText } from "@/components/site-preferences";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function RequestQuotePage() {
  if (isPreviewMode) return <div className="container page-shell"><h1 className="page-title"><LocalizedText id="requestProjectPriceTitle" /></h1><PreviewModeNotice /></div>;
  const user = await getCurrentUser();
  if (!user) return <div className="container page-shell"><h1 className="page-title"><LocalizedText id="requestProjectPriceTitle" /></h1><p className="page-intro"><LocalizedText id="signInToTrackProject" /></p><Link className="button" href="/login"><LocalizedText id="signIn" /></Link><Link className="button ghost" href="/register" style={{ marginLeft: 10 }}><LocalizedText id="register" /></Link></div>;
  const [products, services] = await Promise.all([
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { id: true, name: true } })
  ]);
  const catalog = [
    ...products.map((item) => ({ ...item, kind: "product" as const })),
    ...services.map((item) => ({ ...item, kind: "service" as const }))
  ];
  return <div className="container page-shell"><span className="eyebrow"><LocalizedText id="projectCart" /></span><h1 className="page-title"><LocalizedText id="requestProjectPriceTitle" /></h1><p className="page-intro"><LocalizedText id="projectQuoteDescription" /></p><div style={{ maxWidth: 720 }}><ProjectRequestForm catalog={catalog} /></div></div>;
}
