/** Canonical public origin, without a trailing slash. */
export function siteOrigin() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}
