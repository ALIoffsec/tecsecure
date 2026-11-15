import { LocalizedText } from "@/components/site-preferences";
import { pageMetadata } from "@/lib/structured-data";

export const metadata = pageMetadata({
  path: "/about",
  title: "Biz haqimizda",
  description: "Tecsecure — Toshkentdagi IT va kiberxavfsizlik jamoasi: videokuzatuv, tarmoq va xavfsizlik xizmatlari, uskunalar do‘koni va amaliy ta’lim bitta platformada."
});

export default function AboutPage() {
  return <div className="container page-shell" style={{ maxWidth: 860 }}>
    <span className="eyebrow">Tecsecure</span><h1 className="page-title"><LocalizedText id="aboutTitle" /></h1>
    <p className="lead"><LocalizedText id="aboutDescription" /></p>
    <div className="panel-card"><h2><LocalizedText id="transparentWork" /></h2><p className="muted"><LocalizedText id="aboutDisclaimer" /></p></div>
  </div>;
}
