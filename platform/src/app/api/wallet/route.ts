import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const transactionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("DEPOSIT"),
    amountMinor: z.number().int().positive().max(2_000_000_000),
    reference: z.string().trim().min(2).max(160),
    proofMediaId: z.string().cuid()
  }),
  z.object({
    kind: z.literal("WITHDRAWAL"),
    amountMinor: z.number().int().positive().max(2_000_000_000),
    details: z.string().trim().min(10).max(2000)
  })
]);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const [account, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { walletBalanceMinor: true, rewardPoints: true } }),
    prisma.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100
    })
  ]);
  return Response.json({ account, transactions });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "Hamyon so‘rovi faqat mijoz hisobi uchun." }, { status: 403 });
  let input: unknown;
  try { input = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Hamyon so‘rovi ma’lumotlarini tekshiring.", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.kind === "DEPOSIT") {
    const proof = await prisma.mediaAsset.findUnique({ where: { id: parsed.data.proofMediaId }, select: { id: true, mimeType: true } });
    if (!proof || !proof.mimeType.startsWith("image/")) return Response.json({ error: "To‘lov tasdig‘i uchun rasm yuklang." }, { status: 400 });
  }
  const transaction = await prisma.$transaction(async (tx) => {
    const created = await tx.walletTransaction.create({
      data: {
        userId: user.id,
        kind: parsed.data.kind,
        amountMinor: parsed.data.amountMinor,
        reference: parsed.data.kind === "DEPOSIT" ? parsed.data.reference : null,
        proofMediaId: parsed.data.kind === "DEPOSIT" ? parsed.data.proofMediaId : null,
        details: parsed.data.kind === "WITHDRAWAL" ? parsed.data.details : null
      }
    });
    await tx.auditLog.create({
      data: { actorId: user.id, action: `WALLET_${parsed.data.kind}_REQUESTED`, entity: "WalletTransaction", entityId: created.id }
    });
    return created;
  });
  return Response.json({ transaction }, { status: 201 });
}
