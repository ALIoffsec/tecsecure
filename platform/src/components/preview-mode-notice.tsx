import { LocalizedText } from "@/components/site-preferences";

export function PreviewModeNotice() {
  return (
    <div className="notice demo-mode-notice" role="status">
      <strong>DEMO</strong>
      <LocalizedText id="previewModeNotice" />
    </div>
  );
}
