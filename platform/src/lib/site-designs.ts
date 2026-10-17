export const siteDesigns = [
  "midnight",
  "ocean",
  "forest",
  "ember",
  "violet",
  "editorial",
  "terminal"
] as const;

export type SiteDesign = (typeof siteDesigns)[number];

export function isSiteDesign(value: string | null | undefined): value is SiteDesign {
  return siteDesigns.some((design) => design === value);
}
