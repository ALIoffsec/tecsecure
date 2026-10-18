import { ServiceRequestForm } from "@/components/service-request-form";
import { prisma } from "@/lib/prisma";
import { LocalizedText } from "@/components/site-preferences";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import type { ServiceOption } from "@/components/service-request-form";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [services, settings] = isPreviewMode ? [[] as ServiceOption[], []] : await Promise.all([
    prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { id: true, name: true } }),
    prisma.siteSetting.findMany({ where: { key: { in: ["phone", "email", "telegram", "instagram", "address"] } } })
  ]);
  const info = Object.fromEntries(settings.map((item) => [item.key, item.value]));
  const phones = (info.phone || "+998200141455\n+998990782102\n+998931970006").split(/[\n,;|]+/).map((phone) => phone.trim()).filter(Boolean);
  const email = info.email || "itstars134567890@gmail.com";
  const telegram = (info.telegram || "@abdiazizov_m_ali").replace(/^@/, "");
  const instagram = (info.instagram || "@abdiazizov_m_ali").replace(/^@/, "");
  return <div className="container page-shell">
    <span className="eyebrow"><LocalizedText id="contact" /></span><h1 className="page-title"><LocalizedText id="contactTitle" /></h1>
    <div className="two-col">
      <div className="panel-card"><h2><LocalizedText id="contactCompany" /></h2>
        {phones.map((phone) => <p key={phone}><LocalizedText id="phone" />: <a className="text-link" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a></p>)}
        <p><LocalizedText id="email" />: <a className="text-link" href={`mailto:${email}`}>{email}</a></p>
        <p>Telegram: <a className="text-link" href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer">@{telegram}</a></p>
        <p>Instagram: <a className="text-link" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">@{instagram}</a></p>
        {info.address && <p><LocalizedText id="address" />: {info.address}</p>}
      </div>
      {isPreviewMode ? <PreviewModeNotice /> : <ServiceRequestForm services={services} />}
    </div>
  </div>;
}
