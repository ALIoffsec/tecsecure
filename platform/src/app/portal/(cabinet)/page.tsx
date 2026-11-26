import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { prisma } from "@/lib/prisma";
import { cabinetFrameData } from "@/lib/cabinet-data";
import { CabinetHome } from "@/components/cabinet/cabinet-home";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Kabinet | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetHomePage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal");
  const [orders, requests, frame] = await Promise.all([
    prisma.order.findMany({ where: { customerId: user.id }, select: { id: true, reference: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.serviceRequest.findMany({ where: { customerId: user.id }, select: { id: true, reference: true, status: true, createdAt: true, service: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 3 }),
    cabinetFrameData(user.id)
  ]);
  return <CabinetHome orders={orders} requests={requests} nav={frame.nav} />;
}
