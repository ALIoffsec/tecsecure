"use client";

import { useSitePreferences } from "./site-preferences";
import { ServiceJourneys } from "./service-journeys";
import { priceAnswer } from "./services-top";
import type { HomeFacts } from "@/lib/home-facts";

/** The problem cards and FAQ, with the price question answered from what staff entered. */
export function ServicesFaq({ facts }: { facts: HomeFacts }) {
  const { locale } = useSitePreferences();
  return <ServiceJourneys priceAnswer={priceAnswer(facts, locale)} />;
}
