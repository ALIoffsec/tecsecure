import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getCurrentUser, isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { escapeTelegramHtml, notifyTelegramAdmins, notifyTelegramUser } from "@/lib/telegram";

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
  const product = await prisma.product.findFirst({ where: { id, status: "PUBLISHED" }, select: { id: true, name: true } });
  if (!product) return Response.json({ error: "Mahsulot topilmadi." }, { status: 404 });
  const reference = `QST-${new Date().getUTCFullYear()}-${randomBytes(5).toString("hex").toUpperCase()}`;
  const phone = await prisma.user.findUnique({ where: { id: user.id }, select: { phone: true } });
  const question = await prisma.$transaction(async (tx) => {
    const created = await tx.productQuestion.create({
      data: { productId: id, userId: user.id, question: parsed.data.question }
    });
    await tx.portalConversation.create({
      data: {
        reference,
        category: "PRODUCT",
        sourceType: "PRODUCT_QUESTION",
        sourceId: created.id,
        subject: `Mahsulot savoli: ${product.name}`,
        customerName: user.name,
        customerPhone: phone?.phone,
        customerId: user.id,
        messages: { create: { sender: "CUSTOMER", body: parsed.data.question } }
      }
    });
    const staff = await tx.user.findMany({
      where: { role: { in: ["FOUNDER", "ADMIN", "STAFF"] }, active: true },
      select: { id: true }
    });
    if (staff.length) {
      await tx.notification.createMany({
        data: staff.map((member) => ({
          userId: member.id,
          channel: "IN_APP",
          event: "PRODUCT_QUESTION_RECEIVED",
          status: "DELIVERED",
          payload: { reference, questionId: created.id, productId: id }
        }))
      });
    }
    return created;
  });
  await notifyTelegramAdmins([
    "<b>Mahsulot bo‘yicha savol</b>",
    `Raqam: <code>${escapeTelegramHtml(reference)}</code>`,
    `Mijoz: ${escapeTelegramHtml(user.name)} · ${escapeTelegramHtml(user.email)}`,
    `Mahsulot: ${escapeTelegramHtml(product.name)}`,
    `Savol: ${escapeTelegramHtml(parsed.data.question)}`,
    "",
    `Javob: <code>/reply ${escapeTelegramHtml(reference)} matn</code>`
  ].join("\n"), reference);
  return Response.json({ ok: true, questionId: question.id, reference }, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authorized = await requireModuleApi("PRODUCTS");
  if (isResponse(authorized)) return authorized;
  const parsed = answerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Javob matnini kiriting." }, { status: 400 });
  try {
    const result = await prisma.$transaction(async (tx) => {
      const question = await tx.productQuestion.findFirst({
        where: { id: parsed.data.questionId, productId: id },
        select: { id: true, userId: true }
      });
      if (!question) return null;
      await tx.productQuestion.update({
        where: { id: question.id },
        data: { answer: parsed.data.answer, answeredAt: new Date() }
      });
      const conversation = await tx.portalConversation.findUnique({
        where: { sourceType_sourceId: { sourceType: "PRODUCT_QUESTION", sourceId: question.id } },
        select: { id: true, reference: true }
      });
      if (conversation) {
        await tx.portalMessage.create({
          data: { conversationId: conversation.id, sender: "ADMIN", body: parsed.data.answer }
        });
        await tx.notification.create({
          data: {
            userId: question.userId,
            channel: "IN_APP",
            event: "SUPPORT_MESSAGE_RECEIVED",
            status: "DELIVERED",
            payload: { reference: conversation.reference }
          }
        });
      }
      return { userId: question.userId, reference: conversation?.reference };
    });
    if (!result) return Response.json({ error: "Savol topilmadi." }, { status: 404 });
    if (result.reference) {
      await notifyTelegramUser(
        result.userId,
        `<b>Tecsecure: mahsulot savolingizga javob keldi</b>\nRaqam: <code>${escapeTelegramHtml(result.reference)}</code>\n\n${escapeTelegramHtml(parsed.data.answer)}`
      );
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) console.error("Product question answer database error", error);
    else console.error("Product question answer failed", error);
    return Response.json({ error: "Savolga javobni saqlab bo‘lmadi." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
