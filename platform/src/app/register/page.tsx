import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  if (await getCurrentUser()) redirect("/portal");
  return <div className="container page-shell"><AuthForm mode="register" /></div>;
}
