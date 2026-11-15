/**
 * This site has no Server Actions (no "use server" anywhere), so a request carrying a `Next-Action`
 * header is a scanner probing Next.js. Left to Next, the urlencoded variant is answered with a 404 that
 * renders without the root layout and ended as a 500, which then reached the team as "Saytda xato".
 * Such requests get a plain 400 here instead.
 *
 * If a Server Action is ever added, delete this file (or narrow the matcher), or every action will fail.
 */
export function proxy() {
  return new Response("Bad request.", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

export const config = {
  // Runs only when the header is present; ordinary traffic never reaches the proxy.
  matcher: [{ source: "/:path*", has: [{ type: "header", key: "next-action" }] }]
};
