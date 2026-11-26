import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { cabinetDevices } from "@/lib/cabinet-data";
import { CabinetTitle, DevicesSection } from "@/components/cabinet/sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Qurilmalarim | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetDevicesPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/devices");
  return <><CabinetTitle section="devices" /><DevicesSection {...await cabinetDevices(user.id)} /></>;
}
