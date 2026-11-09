/**
 * The visitor's address as our own nginx saw it. nginx appends the real address to the end of
 * X-Forwarded-For ($proxy_add_x_forwarded_for), while everything before it was written by the client and
 * can be anything, so only the last entry is trusted. Rate limits keyed on the first entry could be dodged
 * by sending a different made-up address with every request.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const last = forwarded?.split(",").map(part => part.trim()).filter(Boolean).at(-1);
  return last || request.headers.get("x-real-ip")?.trim() || "unknown";
}
