import { MaintenanceNotice } from "@/components/maintenance-notice";
import { LocalizedText } from "@/components/site-preferences";

export default function LearningPage() {
  return <div className="container page-shell">
    <span className="eyebrow"><LocalizedText id="learning" /></span>
    <MaintenanceNotice title="educationMaintenanceTitle" description="educationMaintenanceDescription" />
  </div>;
}
