import { Prisma } from "@prisma/client";
import { getCurrentUser, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTransitionRequest } from "@/lib/request-status";
import { escapeTelegramHtml, notifyTelegramUser } from "@/lib/telegram";
import { z } from "zod";

export const runtime = "nodejs";

const transitionSchema = z.object({
  status: z.enum([
    "UNDER_REVIEW", "CONTACTED", "INSPECTION_REQUIRED", "QUOTATION_SENT",
    "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"
  ]),
  note: z.string().trim().max(1000).optional()
});
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") {
    const authorized = await requireModuleApi("REQUESTS");
    if (authorized instanceof Response) return authorized;
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = transitionSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Status noto‘g‘ri." }, { status: 400 });
  const { id } = await context.params;
  const admin = user.role !== "CUSTOMER";

  try {
    const result = await prisma.$transaction(async (tx) => {
      const record = await tx.serviceRequest.findUnique({ where: { id } });
      if (!record) return { error: "Ariza topilmadi.", status: 404 as const };
      if (!admin && record.customerId !== user.id) return { error: "Bu arizaga ruxsat yo‘q.", status: 403 as const };
      if (!canTransitionRequest(record.status, parsed.data.status, !admin)) {
        if (!admin && parsed.data.status !== "CANCELLED") {
          return { error: "Mijoz faqat o‘z arizasini bekor qilishi mumkin.", status: 403 as const };
        }
        return { error: `Status ${record.status} holatidan ${parsed.data.status} holatiga o‘ta olmaydi.`, status: 409 as const };
      }
      const updated = await tx.serviceRequest.update({
        where: { id },
        data: {
          status: parsed.data.status,
          history: {
            create: {
              fromStatus: record.status,
              toStatus: parsed.data.status,
              actorId: user.id,
              note: parsed.data.note
            }
          }
        }
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "REQUEST_STATUS_CHANGED",
          entity: "ServiceRequest",
          entityId: id,
          metadata: { from: record.status, to: parsed.data.status }
        }
      });
      if (record.customerId) {
        await tx.notification.create({
          data: {
            userId: record.customerId,
            channel: "IN_APP",
            event: "SERVICE_REQUEST_STATUS_CHANGED",
            status: "DELIVERED",
            payload: { reference: record.reference, status: parsed.data.status }
          }
        });
      }
      return { request: updated };
    });
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
    if (admin && result.request.customerId) {
      await notifyTelegramUser(
        result.request.customerId,
        `<b>Tecsecure: murojaat holati yangilandi</b>\nRaqam: <code>${escapeTelegramHtml(result.request.reference)}</code>\nYangi holat: ${escapeTelegramHtml(parsed.data.status)}`
      );
    }
    return Response.json({ request: result.request });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) console.error("Request update database error", error);
    else console.error("Request update failed", error);
    return Response.json({ error: "Ariza holatini yangilab bo‘lmadi." }, { status: 500 });
  }
}
