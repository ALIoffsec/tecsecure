import { MaintenanceNotice } from "@/components/maintenance-notice";
import { LocalizedText } from "@/components/site-preferences";

export default function LearningArticlePage() {
  return <article className="container page-shell">
    <span className="eyebrow"><LocalizedText id="learning" /></span>
    <MaintenanceNotice title="educationMaintenanceTitle" description="educationMaintenanceDescription" />
  </article>;
}
