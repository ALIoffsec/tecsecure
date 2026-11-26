import { redirect } from "next/navigation";
import { legacyPortalPath } from "@/lib/cabinet-routes";

export const dynamic = "force-dynamic";

/** The old one-page cabinet: every `?section=` now has its own page. Temporary redirect, kept for old links. */
export default async function LegacyProfilePage({ searchParams }: { searchParams: Promise<{ section?: string | string[] }> }) {
  const section = (await searchParams).section;
  redirect(legacyPortalPath(typeof section === "string" ? section : null));
}
