import { LocalizedText } from "@/components/site-preferences";

export default function TermsPage() {
  return <article className="container page-shell" style={{ maxWidth: 900 }}>
    <span className="eyebrow"><LocalizedText id="termsTitle" /></span><h1 className="page-title"><LocalizedText id="termsTitle" /></h1>
    <div className="panel-card"><p><LocalizedText id="termsText1" /></p><p><LocalizedText id="termsText2" /></p><p><LocalizedText id="termsText3" /></p></div>
  </article>;
}
