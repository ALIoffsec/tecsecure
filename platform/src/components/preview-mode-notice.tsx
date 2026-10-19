import { LocalizedText } from "@/components/site-preferences";

export function PreviewModeNotice() {
  return (
    <div className="notice" role="status">
      <LocalizedText id="previewModeNotice" />
    </div>
  );
}
