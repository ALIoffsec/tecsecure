import { getCurrentUser } from "@/lib/auth";
import { CUSTOMER_EVENTS } from "@/lib/notifications";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.string().cuid() });

/** Marks one of the customer's own notifications read. Repeating it is fine; someone else's id is 404. */
export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (isPreviewMode) return Response.json({ error: "Bildirishnomalar hozircha mavjud emas." }, { status: 503 });

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) return Response.json({ error: "Bildirishnoma topilmadi." }, { status: 404 });
  const own = { id: parsed.data.id, userId: user.id, channel: "IN_APP", event: { in: [...CUSTOMER_EVENTS] } };
  const updated = await prisma.notification.updateMany({ where: { ...own, status: "UNREAD" }, data: { status: "READ" } });
  if (updated.count) return Response.json({ read: true });
  const exists = await prisma.notification.count({ where: own });
  if (!exists) return Response.json({ error: "Bildirishnoma topilmadi." }, { status: 404 });
  return Response.json({ read: true });
}
