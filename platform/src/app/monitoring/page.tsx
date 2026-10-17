import Link from "next/link";
import { LocalizedText } from "@/components/site-preferences";

export default function MonitoringPage() {
  return <div className="container page-shell" style={{ maxWidth: 900 }}>
    <span className="eyebrow"><LocalizedText id="monitoring" /></span><h1 className="page-title"><LocalizedText id="monitoringTitle" /></h1>
    <p className="lead"><LocalizedText id="inventoryDisclaimer" /></p>
    <div className="panel-card"><p><LocalizedText id="noMonitoringChecks" /></p><p className="muted"><LocalizedText id="monitoringRequirements" /></p><Link className="button secondary" href="/portal"><LocalizedText id="openPortal" /></Link></div>
  </div>;
}
