import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTelegramWalletKeyboard, escapeTelegramHtml, getTelegramAdminPanelUrl, notifyTelegramAdminsWithProof } from "@/lib/telegram";
import { formatNumber } from "@/lib/format";
import { z } from "zod";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { MAX_PENDING_REQUESTS, withdrawalRoom } from "@/lib/wallet-rules";
import { lockProof, proofInUse, proofUsedMessage } from "@/lib/payment-proof";

class WalletRequestRefused extends Error {
  constructor(readonly code: "TOO_MANY_PENDING" | "OVER_BALANCE" | "PROOF_USED") { super(code); }
}
const refusals: Record<WalletRequestRefused["code"], string> = {
  TOO_MANY_PENDING: "Ko‘rib chiqilayotgan so‘rovlaringiz ko‘p. Avvalgilari hal bo‘lishini kuting.",
  OVER_BALANCE: "Yechish summasi mavjud balansdan (kutilayotgan yechishlarni hisobga olib) oshadi.",
  PROOF_USED: proofUsedMessage
};

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
  const limited = await rateLimit("wallet-request", user.id, 10, 60 * 60 * 1000);
  if (!limited.ok) return tooManyAttempts(limited.retryAfterSeconds);
  if (parsed.data.kind === "DEPOSIT") {
    const proof = await prisma.mediaAsset.findUnique({ where: { id: parsed.data.proofMediaId }, select: { id: true, mimeType: true, ownerId: true } });
    if (!proof || proof.ownerId !== user.id || !proof.mimeType.startsWith("image/")) return Response.json({ error: "To‘lov tasdig‘i uchun rasm yuklang." }, { status: 400 });
  }
  let transaction;
  try {
  transaction = await prisma.$transaction(async (tx) => {
    // The account row is locked first, so two requests are checked one after the other.
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id} FOR UPDATE`;
    const [account, pending, pendingOut] = await Promise.all([
      tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { walletBalanceMinor: true } }),
      tx.walletTransaction.count({ where: { userId: user.id, status: "PENDING" } }),
      tx.walletTransaction.aggregate({ where: { userId: user.id, status: "PENDING", kind: "WITHDRAWAL" }, _sum: { amountMinor: true } })
    ]);
    if (pending >= MAX_PENDING_REQUESTS) throw new WalletRequestRefused("TOO_MANY_PENDING");
    if (parsed.data.kind === "WITHDRAWAL" && parsed.data.amountMinor > withdrawalRoom(account.walletBalanceMinor, pendingOut._sum.amountMinor ?? 0)) {
      throw new WalletRequestRefused("OVER_BALANCE");
    }
    if (parsed.data.kind === "DEPOSIT") {
      await lockProof(tx, parsed.data.proofMediaId);
      if (await proofInUse(tx, parsed.data.proofMediaId)) throw new WalletRequestRefused("PROOF_USED");
    }
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
    const staff = await tx.user.findMany({ where: { role: { in: ["FOUNDER", "ADMIN", "STAFF"] }, active: true }, select: { id: true } });
    if (staff.length) {
      await tx.notification.createMany({
        data: staff.map((member) => ({
          userId: member.id, channel: "IN_APP", event: `WALLET_${parsed.data.kind}_REQUESTED`, status: "DELIVERED",
          payload: { transactionId: created.id, amountMinor: created.amountMinor }
        }))
      });
    }
    return created;
  });
  } catch (error) {
    if (error instanceof WalletRequestRefused) return Response.json({ error: refusals[error.code], code: error.code }, { status: 409 });
    throw error;
  }
  const proof = transaction.proofMediaId
    ? await prisma.mediaAsset.findUnique({ where: { id: transaction.proofMediaId }, select: { data: true, mimeType: true, name: true } })
    : null;
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { walletBalanceMinor: true } });
  const isDeposit = transaction.kind === "DEPOSIT";
  await notifyTelegramAdminsWithProof(
    [
      isDeposit ? "<b>💳 Hisobni to‘ldirish arizasi</b>" : "<b>💸 Pul yechish arizasi</b>",
      `Mijoz: ${escapeTelegramHtml(user.name)} (${escapeTelegramHtml(user.email)})`,
      `Summa: <b>${formatNumber(transaction.amountMinor / 100)} so‘m</b>`,
      account ? `Joriy balans: ${formatNumber(account.walletBalanceMinor / 100)} so‘m` : "",
      transaction.reference ? `To‘lov izohi: ${escapeTelegramHtml(transaction.reference)}` : "",
      transaction.details ? `Rekvizitlar: ${escapeTelegramHtml(transaction.details)}` : ""
    ].filter(Boolean).join("\n"),
    proof,
    createTelegramWalletKeyboard(transaction.id, getTelegramAdminPanelUrl())
  );
  return Response.json({ transaction }, { status: 201 });
}
