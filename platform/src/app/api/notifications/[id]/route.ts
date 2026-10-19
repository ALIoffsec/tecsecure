import { getCurrentUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.string().cuid() });

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (isPreviewMode) return Response.json({ error: "Bildirishnomalar hozircha mavjud emas." }, { status: 503 });

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) return Response.json({ error: "Bildirishnoma topilmadi." }, { status: 404 });

  const updated = await prisma.notification.updateMany({
    where: {
      id: parsed.data.id,
      userId: user.id,
      channel: "IN_APP",
      event: "TEC_GIFT",
      status: "UNREAD"
    },
    data: { status: "READ" }
  });
  if (!updated.count) return Response.json({ error: "Bildirishnoma topilmadi yoki allaqachon o‘qilgan." }, { status: 404 });
  return Response.json({ read: true });
}
