"use client";

import type { ReactNode } from "react";
import { CollapsibleSpecs, ExpandableText } from "./product-detail-tabs";
import { useSitePreferences } from "./site-preferences";
import type { Locale } from "@/lib/messages";

/** Server pages hand over all three versions; this shows the one for the language chosen in the browser. */
export function Localized({ values }: { values: Record<Locale, ReactNode> }) {
  const { locale } = useSitePreferences();
  return <>{values[locale]}</>;
}

export function LocalizedText({ values }: { values: Record<Locale, string> }) {
  const { locale } = useSitePreferences();
  return <ExpandableText key={locale} text={values[locale]} />;
}

export function LocalizedSpecs({ rows }: { rows: Record<Locale, [ReactNode, string][]> }) {
  const { locale } = useSitePreferences();
  return <CollapsibleSpecs key={locale} rows={rows[locale]} />;
}
