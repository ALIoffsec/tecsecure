import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { catalogMedia } from "@/lib/catalog-media";

const schema = z.object({ ids: z.array(z.string().cuid()).min(1).max(50) });
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Mahsulotlar ro‘yxati noto‘g‘ri." }, { status: 400 });
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: parsed.data.ids }, status: "PUBLISHED" },
      select: { id: true, name: true, slug: true, translations: true, description: true, priceMinor: true, currency: true, stockStatus: true, media: true, category: { select: { slug: true } } }
    });
    const getMedia = await catalogMedia(products);
    return Response.json({ products: products.map(({ media, ...product }) => ({ ...product, assets: getMedia(media) })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (issue) {
    console.error("Cart preview failed", issue);
    return Response.json({ error: "Savat ma’lumotlarini yuklab bo‘lmadi. Qayta urinib ko‘ring." }, { status: 503 });
  }
}
