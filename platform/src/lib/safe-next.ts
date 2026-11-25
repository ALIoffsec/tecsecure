/**
 * Where to send someone after they sign in. The address comes from the URL (`?next=`), so only a path on
 * this site that a customer may open is accepted; everything else falls back to the usual page for the role.
 */

/** First path segments of customer pages (folders under src/app). "" is the home page. */
const ALLOWED_SECTIONS = new Set([
  "", "about", "careers", "cart", "consultation", "contact", "cybersecurity", "estimate", "install", "learning",
  "licenses", "monitoring", "news", "portal", "privacy", "products", "request-quote", "request-service", "ru", "s",
  "sample-report", "search", "security-check", "services", "shop", "store", "support-plans", "terms", "verify", "work", "xizmat"
]);

const MAX_LENGTH = 512;
const BASE = "https://next.invalid";

/** The path and query to open, or null when the value is not a safe address on this site. */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 1 || value.length > MAX_LENGTH || !value.startsWith("/")) return null;
  // Spaces, control characters and backslashes have no place in a link we build ourselves.
  if (/[\u0000- \u007f\\]/.test(value)) return null;
  const pathPart = value.split(/[?#]/, 1)[0];
  if (/%(5c|2f|00)/i.test(pathPart)) return null;
  let url: URL;
  try { url = new URL(value, BASE); } catch { return null; }
  if (url.origin !== BASE || url.pathname.includes("//")) return null;
  const section = url.pathname.split("/")[1] ?? "";
  if (!ALLOWED_SECTIONS.has(section)) return null;
  return url.pathname + url.search;
}

export function safeNext(value: unknown, fallback: string): string {
  return safeNextPath(value) ?? fallback;
}

export type SignedInRole = "CUSTOMER" | "STAFF" | "ADMIN" | "FOUNDER" | string;

export function isStaffRole(role: SignedInRole): boolean {
  return role === "STAFF" || role === "ADMIN" || role === "FOUNDER";
}

/** Staff always land in the admin panel; a customer goes to the asked page or the cabinet. */
export function landingFor(role: SignedInRole, next: unknown): string {
  return isStaffRole(role) ? "/admin" : safeNext(next, "/portal");
}

/** The sign-in page address that brings the person back to `path` afterwards. */
export function loginPath(path: unknown, page: "/login" | "/register" | "/login/code" | "/login/reset" = "/login"): string {
  const next = safeNextPath(path);
  return next ? `${page}?next=${encodeURIComponent(next)}` : page;
}

/** Name of the short cookie that carries `next` across an OAuth sign-in that stops for the authenticator code. */
export const TWO_FACTOR_NEXT_COOKIE = "tecsecure_2fa_next";
export const TWO_FACTOR_NEXT_SECONDS = 10 * 60;
