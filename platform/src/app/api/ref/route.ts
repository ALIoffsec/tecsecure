import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { REFERRAL_COOKIE, REFERRAL_DAYS } from "@/lib/referral";

export const runtime = "nodejs";

/**
 * Remembers which shop's page or QR brought this visitor, so that shop pays the lower commission on what
 * the visitor buys from it in the next 30 days. Only an active shop counts.
 */
export async function POST(request: Request) {
  const parsed = z.object({ slug: z.string().trim().min(1).max(80) }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const shop = await prisma.shop.findFirst({ where: { slug: parsed.data.slug, status: "ACTIVE" }, select: { id: true } });
  if (!shop) return Response.json({ ok: false }, { status: 404 });
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${REFERRAL_COOKIE}=${shop.id}; Path=/; Max-Age=${REFERRAL_DAYS * 24 * 60 * 60}; HttpOnly; SameSite=Lax${secure}`, "Cache-Control": "no-store" } });
}
