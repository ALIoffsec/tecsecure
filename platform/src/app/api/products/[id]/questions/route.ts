import { z } from "zod";
import { getCurrentUser, isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const questionSchema = z.object({ question: z.string().trim().min(5).max(500) });
const answerSchema = z.object({ questionId: z.string().min(1), answer: z.string().trim().min(2).max(2000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Savol berish uchun hisobga kiring." }, { status: 401 });
  if (!(await checkRateLimit("product-question", user.id, 10, 60 * 60 * 1000))) {
    return Response.json({ error: "Limit oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }
  const parsed = questionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Savol kamida 5 belgidan iborat bo‘lsin." }, { status: 400 });
  const product = await prisma.product.findFirst({ where: { id, status: "PUBLISHED" }, select: { id: true } });
  if (!product) return Response.json({ error: "Mahsulot topilmadi." }, { status: 404 });
  await prisma.productQuestion.create({ data: { productId: id, userId: user.id, question: parsed.data.question } });
  return Response.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authorized = await requireModuleApi("PRODUCTS");
  if (isResponse(authorized)) return authorized;
  const parsed = answerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Javob matnini kiriting." }, { status: 400 });
  const result = await prisma.productQuestion.updateMany({
    where: { id: parsed.data.questionId, productId: id },
    data: { answer: parsed.data.answer, answeredAt: new Date() }
  });
  if (result.count === 0) return Response.json({ error: "Savol topilmadi." }, { status: 404 });
  return Response.json({ ok: true });
}
