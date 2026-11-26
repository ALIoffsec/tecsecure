import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { normalizePhone } from "./phone";
import { prisma } from "./prisma";
import { deletionBlockers, type DeletionBlocker } from "./account-rules";

export type AnonymizeResult = { ok: true } | { ok: false; blockers: DeletionBlocker[] } | { ok: false; conflict: true };

/**
 * The one way an account is closed, for the customer and for staff alike. Nothing that records money or
 * learning is deleted (orders, wallet lines, payments, invoices, certificates, receipts, audit); the person's
 * details and every way to sign in are. Blocked while money or work is still open, checked under a lock.
 */
export async function anonymizeAccount(userId: string, actorId: string): Promise<AnonymizeResult> {
  const passwordHash = await bcrypt.hash(randomBytes(32).toString("base64url"), 12);
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true, email: true, phone: true, walletBalanceMinor: true, deletedAt: true } });
      if (!user || user.deletedAt) return { ok: true as const };

      const project = { quotation: { project: { customerId: userId } } };
      const [pendingWallet, openOrders, openPayments, openDisputes, unpaidInvoices, pendingPayments, activeProjects, shop, ownedOrgs, paymePending] = await Promise.all([
        tx.walletTransaction.count({ where: { userId, status: "PENDING" } }),
        tx.order.count({ where: { customerId: userId, status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
        tx.order.count({ where: { customerId: userId, paymentStatus: { in: ["AWAITING_CONFIRMATION", "REFUND_DUE"] } } }),
        tx.shopOrder.count({ where: { order: { customerId: userId }, disputedAt: { not: null }, disputeResolvedAt: null } }),
        tx.invoice.count({ where: { status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] }, ...project } }),
        tx.payment.count({ where: { status: "PENDING", invoice: project } }),
        tx.project.count({ where: { customerId: userId, status: { in: ["APPROVED", "IN_PROGRESS"] } } }),
        tx.shop.findUnique({ where: { ownerId: userId }, select: { id: true, balanceMinor: true, payouts: { where: { status: "REQUESTED" }, select: { id: true } }, shopOrders: { where: { status: { notIn: ["DELIVERED", "CANCELLED"] } }, select: { id: true } } } }),
        tx.organizationMember.findMany({ where: { userId, role: "OWNER" }, select: { organizationId: true } }),
        tx.paymeTransaction.count({ where: { state: 1, order: { customerId: userId } } })
      ]);
      const soleOwner = ownedOrgs.length
        ? await tx.organizationMember.count({ where: { organizationId: { in: ownedOrgs.map(org => org.organizationId) }, role: "OWNER", userId: { not: userId } } }) < ownedOrgs.length
        : false;
      const blockers = deletionBlockers({
        walletBalanceMinor: user.walletBalanceMinor, pendingWallet, openOrders, openPayments, openDisputes, unpaidInvoices, pendingPayments, activeProjects,
        shopBalanceMinor: shop?.balanceMinor ?? 0, shopPayouts: shop?.payouts.length ?? 0, shopOpenParts: shop?.shopOrders.length ?? 0,
        soleOwner, paymePending
      });
      if (blockers.length) return { ok: false as const, blockers };

      const phone = user.phone ? normalizePhone(user.phone) : null;
      await tx.user.update({
        where: { id: userId },
        data: {
          name: "O‘chirilgan foydalanuvchi", email: `deleted-${userId}@deleted.invalid`, phone: null, phoneVerifiedAt: null,
          telegramChatId: null, telegramLinkToken: null, telegramLinkExpiresAt: null,
          twoFactorSecret: null, twoFactorEnabledAt: null, twoFactorBackupCodes: [], twoFactorLastStep: null,
          passwordHash, active: false, deletedAt: new Date()
        }
      });
      await tx.session.deleteMany({ where: { userId } });
      await tx.oAuthAccount.deleteMany({ where: { userId } });
      const contacts = [user.email, phone].filter((value): value is string => Boolean(value));
      await tx.otpCode.deleteMany({
        where: { OR: [{ target: { in: contacts } }, { target: { startsWith: `${userId}:` } }, { target: { startsWith: `reauth:${userId}:` } }, { target: { startsWith: `verify:${userId}:` } }] }
      });
      if (phone) await tx.phoneVerification.deleteMany({ where: { phone } });
      await tx.serviceRequest.updateMany({
        where: { customerId: userId },
        data: { customerId: null, name: "Deleted account", phone: "", email: null, organizationName: null, city: null, location: null, description: "[Request details removed after account deletion]", budgetRange: null, preferredContactTime: null }
      });
      await tx.project.updateMany({ where: { customerId: userId }, data: { customerId: null, name: "Archived customer project", notes: null, city: null } });
      await tx.portalMessage.updateMany({ where: { conversation: { customerId: userId } }, data: { body: "[Message content removed after account deletion]" } });
      await tx.portalConversation.updateMany({ where: { customerId: userId }, data: { customerId: null, customerName: "Deleted account", customerPhone: null, subject: "Archived conversation" } });
      await tx.organizationMember.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.auditLog.create({ data: { actorId, action: "USER_DELETED", entity: "User", entityId: userId, metadata: { by: actorId === userId ? "self" : "staff" } } });
      return { ok: true as const };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return { ok: false, conflict: true };
    throw error;
  }
}
