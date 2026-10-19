import { getCurrentUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ notifications: [] });
  if (isPreviewMode) return Response.json({ notifications: [] });

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id, channel: "IN_APP", event: "TEC_GIFT" },
    select: { id: true, status: true, payload: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20
  });
  return Response.json({ notifications }, { headers: { "Cache-Control": "private, no-store" } });
}
