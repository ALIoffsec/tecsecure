import Link from "next/link";
import { LocalizedText } from "@/components/site-preferences";
import { pageMetadata } from "@/lib/structured-data";

export const metadata = pageMetadata({
  path: "/cybersecurity",
  title: "Kiberxavfsizlik: konsultatsiya, himoya va baholash",
  description: "Konsultatsiya, himoyani mustahkamlash va xavfsizlikni baholash ishlari faqat yozma ruxsat, tasdiqlangan ko‘lam va kelishilgan vaqt oynasi bilan bajariladi."
});

export default function CybersecurityPage() {
  return <div className="container page-shell" style={{ maxWidth: 900 }}>
    <span className="eyebrow">IT</span><h1 className="page-title"><LocalizedText id="cyberTitle" /></h1>
    <p className="lead"><LocalizedText id="cyberIntro" /></p>
    <div className="panel-card"><h2><LocalizedText id="process" /></h2><ol><li><LocalizedText id="cyberStep1" /></li><li><LocalizedText id="cyberStep2" /></li><li><LocalizedText id="cyberStep3" /></li></ol><p className="muted"><LocalizedText id="noSecurityTools" /></p><Link className="button" href="/request-service"><LocalizedText id="requestConsultation" /></Link> <Link className="button ghost" href="/sample-report">Namunaviy hisobot tuzilishi</Link></div>
  </div>;
}
