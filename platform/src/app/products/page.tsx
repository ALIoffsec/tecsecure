import { LocalizedText } from "@/components/site-preferences";
import { MaintenanceNotice } from "@/components/maintenance-notice";

export default function ProductsPage() {
  return <div className="container page-shell">
    <span className="eyebrow"><LocalizedText id="products" /></span>
    <MaintenanceNotice title="marketMaintenanceTitle" description="marketMaintenanceDescription" />
  </div>;
}
