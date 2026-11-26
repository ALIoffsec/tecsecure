import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** The customer withdraws their own request while staff have not looked at it yet. */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const { id } = await context.params;
  const cancelled = await prisma.$transaction(async (tx) => {
    const result = await tx.walletTransaction.updateMany({ where: { id, userId: user.id, status: "PENDING" }, data: { status: "CANCELLED" } });
    if (result.count === 0) return false;
    await tx.auditLog.create({ data: { actorId: user.id, action: "WALLET_REQUEST_CANCELLED", entity: "WalletTransaction", entityId: id } });
    return true;
  });
  if (cancelled) return Response.json({ ok: true });
  const exists = await prisma.walletTransaction.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  return exists
    ? Response.json({ error: "Bu so‘rov allaqachon ko‘rib chiqilgan." }, { status: 409 })
    : Response.json({ error: "Hamyon so‘rovi topilmadi." }, { status: 404 });
}
