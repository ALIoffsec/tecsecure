import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/site-origin";

export const runtime = "nodejs";

/** The QR code of a shop's page, as a PNG for printing on visit cards, stickers and price tags. */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await prisma.shop.findFirst({ where: { slug, status: "ACTIVE" }, select: { slug: true } });
  if (!shop) return new Response("Not found", { status: 404 });
  const size = Math.min(2000, Math.max(200, Number(new URL(request.url).searchParams.get("size")) || 900));
  const png = await QRCode.toBuffer(`${siteOrigin()}/s/${shop.slug}`, { type: "png", width: size, margin: 2, errorCorrectionLevel: "M" });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400", "Content-Disposition": `inline; filename="tecsecure-${shop.slug}-qr.png"` } });
}
