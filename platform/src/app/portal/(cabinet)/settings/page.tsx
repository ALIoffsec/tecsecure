import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { prisma } from "@/lib/prisma";
import { ProfileDetails } from "@/components/profile-details";
import { TwoFactorSettings } from "@/components/two-factor";
import { CabinetTitle } from "@/components/cabinet/sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Sozlamalar | Tecsecure" }, robots: { index: false, follow: false } };

/** Open to staff too: their password and two-factor live here. */
export default async function CabinetSettingsPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/settings");
  const account = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { name: true, email: true, phone: true, role: true } });
  return <><CabinetTitle section="settings" /><ProfileDetails user={account} /><TwoFactorSettings /></>;
}
