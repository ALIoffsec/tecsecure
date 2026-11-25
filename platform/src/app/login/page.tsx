import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { isPreviewMode } from "@/lib/preview-mode";
import { pageMetadata } from "@/lib/structured-data";
import { landingFor, safeNextPath } from "@/lib/safe-next";

export const dynamic = "force-dynamic";

// Personal or sign-in page: reachable, but kept out of search results.
export const metadata = { ...pageMetadata({
    path: "/login",
    title: "Kirish",
    description: "Tecsecure hisobingizga kiring."
  }), robots: { index: false, follow: true } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  const { next } = await searchParams;
  const redirectTo = safeNextPath(next) ?? undefined;
  const user = await getCurrentUser();
  if (user) redirect(landingFor(user.role, redirectTo));
  return <div className="container page-shell"><AuthForm mode="login" redirectTo={redirectTo} /></div>;
}
