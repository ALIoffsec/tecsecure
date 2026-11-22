/** Google Fonts families per site design (matches the --design-font-* values in globals.css). */
const families = {
  manrope: "Manrope:wght@400;500;600;700;800",
  dmSans: "DM+Sans:wght@400;500;600;700",
  outfit: "Outfit:wght@400;500;600;700;800",
  plex: "IBM+Plex+Sans:wght@400;500;600;700",
  grotesk: "Space+Grotesk:wght@400;500;600;700",
  playfair: "Playfair+Display:wght@400;500;600;700",
  mono: "JetBrains+Mono:wght@400;500;600;700"
} as const;

type Family = keyof typeof families;

/** Manrope and DM Sans are named directly by base rules (brand, metrics, avatars), so every design keeps them. */
const base: Family[] = ["dmSans", "manrope"];

const byDesign: Record<string, Family[]> = {
  liquid: [],
  midnight: [],
  ocean: ["outfit"],
  forest: ["plex"],
  ember: ["grotesk"],
  violet: ["grotesk"],
  editorial: ["playfair"],
  terminal: ["mono"]
};

export function fontStylesheetFor(design: string | undefined) {
  const list = [...base, ...(design && byDesign[design] || [])];
  return `https://fonts.googleapis.com/css2?${list.map(name => `family=${families[name]}`).join("&")}&display=swap`;
}
