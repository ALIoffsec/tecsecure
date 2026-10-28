import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  const { next } = await searchParams;
  const redirectTo = next === "/learning" ? next : undefined;
  if (await getCurrentUser()) redirect(redirectTo ?? "/portal");
  return <div className="container page-shell"><AuthForm mode="register" redirectTo={redirectTo} /></div>;
}
