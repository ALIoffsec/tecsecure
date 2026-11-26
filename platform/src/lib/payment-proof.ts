import type { Prisma } from "@prisma/client";
import { PROOF_HOLDING_STATUSES } from "./wallet-rules";

type Tx = Prisma.TransactionClient;

/** Serialises every use of one receipt image until the transaction ends. */
export async function lockProof(tx: Tx, mediaId: string): Promise<void> {
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${`proof:${mediaId}`}))`;
}

/**
 * True when this receipt already backs another wallet request (still open or approved) or another order.
 * Call it after `lockProof`, inside the same transaction.
 */
export async function proofInUse(tx: Tx, mediaId: string, except: { walletId?: string; orderId?: string } = {}): Promise<boolean> {
  const [wallet, orders] = await Promise.all([
    tx.walletTransaction.count({ where: { proofMediaId: mediaId, status: { in: [...PROOF_HOLDING_STATUSES] }, ...(except.walletId ? { id: { not: except.walletId } } : {}) } }),
    tx.order.count({ where: { paymentProofMediaId: mediaId, ...(except.orderId ? { id: { not: except.orderId } } : {}) } })
  ]);
  return wallet + orders > 0;
}

export const proofUsedMessage = "Bu chek avval ishlatilgan. Yangi to‘lov chekini yuklang.";
