import { isResponse, requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const actor = await requireAdminApi();
  if (isResponse(actor)) return actor;
  const notifications = await prisma.notification.findMany({
    where: { userId: actor.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return Response.json({ notifications });
}
