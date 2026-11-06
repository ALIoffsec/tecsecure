export type ProductKind = "dome" | "bullet" | "recorder" | "switch" | "router" | "wifi" | "firewall" | "access" | "server" | "ups" | "phone" | "cable" | "box";

// Order matters: specific device words win over broad ones ("video" or "kamera").
const rules: [ProductKind, RegExp][] = [
  ["recorder", /\b(nvr|dvr|recorder|registrator|video saqlash|video xotira)\b/],
  ["dome", /\b(dome|gumbaz|turret)\b/],
  ["bullet", /\b(bullet|ptz|kamera|videokamera|camera|cctv)\b/],
  ["firewall", /\b(firewall|utm|fortigate|ngfw|xavfsizlik devori)\b/],
  ["access", /\b(kirish|access control|turniket|skud|biometr\w*|nazorat)\b/],
  ["wifi", /\b(wi ?fi|wlan|access point|ruckus|unifi ap|qamrov)\b/],
  ["router", /\b(router|marshrutizator|mikrotik|gateway|shlyuz)\b/],
  ["switch", /\b(switch|kommutator|poe)\b/],
  ["server", /\b(server|nas|rack|shkaf)\b/],
  ["ups", /\b(ups|uzluksiz|ibp|batareya)\b/],
  ["phone", /\b(voip|ip telefon|telefon|phone|ats|pbx)\b/],
  ["cable", /\b(cable|kabel|utp|ftp|optika|patch)\b/]
];
const categoryRules: [ProductKind, RegExp][] = [
  ["bullet", /video|kamera|cctv/],
  ["switch", /tarmoq|network/],
  ["firewall", /xavfsizlik|security/]
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[‑–—_-]+/g, " ").replace(/[‘’ʻʼ`']/g, "");
}

/** Chooses the illustration for a product that has no photo yet. */
export function productKind(input: { name?: string | null; slug?: string | null; categorySlug?: string | null }): ProductKind {
  const text = normalize(`${input.name ?? ""} ${input.slug ?? ""}`);
  for (const [kind, pattern] of rules) if (pattern.test(text)) return kind;
  const category = normalize(input.categorySlug ?? "");
  for (const [kind, pattern] of categoryRules) if (pattern.test(category)) return kind;
  return "box";
}
