import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  const user = await getCurrentUser();
  if (user) redirect(user.role === "FOUNDER" || user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/portal");
  return <div className="container page-shell"><AuthForm mode="login" /></div>;
}
