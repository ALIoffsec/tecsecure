import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  pros: z.string().trim().max(500).optional(),
  cons: z.string().trim().max(500).optional(),
  comment: z.string().trim().min(10).max(2000)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sharh qoldirish uchun hisobga kiring." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "Sharhni faqat mijozlar qoldira oladi." }, { status: 403 });
  if (!(await checkRateLimit("product-review", user.id, 10, 60 * 60 * 1000))) {
    return Response.json({ error: "Limit oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Baho (1–5) va kamida 10 belgili sharh kerak." }, { status: 400 });

  const product = await prisma.product.findFirst({ where: { id, status: "PUBLISHED" }, select: { id: true } });
  if (!product) return Response.json({ error: "Mahsulot topilmadi." }, { status: 404 });
  const bought = await prisma.orderItem.findFirst({
    where: { productId: id, order: { customerId: user.id, status: "DELIVERED" } },
    select: { id: true }
  });
  if (!bought) return Response.json({ error: "Sharhni faqat yetkazib berilgan buyurtma egasi qoldira oladi." }, { status: 403 });

  try {
    await prisma.productReview.create({
      data: { productId: id, userId: user.id, rating: parsed.data.rating, pros: parsed.data.pros || null, cons: parsed.data.cons || null, comment: parsed.data.comment }
    });
  } catch {
    return Response.json({ error: "Siz bu mahsulotga allaqachon sharh qoldirgansiz." }, { status: 409 });
  }
  return Response.json({ ok: true }, { status: 201 });
}
