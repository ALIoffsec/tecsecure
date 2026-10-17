import { LocalizedText } from "@/components/site-preferences";

export default function PrivacyPage() {
  return <article className="container page-shell" style={{ maxWidth: 900 }}>
    <span className="eyebrow"><LocalizedText id="privacyTitle" /></span><h1 className="page-title"><LocalizedText id="privacyTitle" /></h1>
    <div className="panel-card"><h2><LocalizedText id="collectedHeading" /></h2><p><LocalizedText id="collectedText" /></p><h2><LocalizedText id="useHeading" /></h2><p><LocalizedText id="useText" /></p><h2><LocalizedText id="retentionHeading" /></h2><p><LocalizedText id="retentionText" /></p></div>
  </article>;
}
