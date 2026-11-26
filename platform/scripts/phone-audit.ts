/**
 * Read-only report on proved phone numbers. Changes nothing.
 *
 *   npm run phone:audit
 *
 * Lists: numbers proved on two or more customer accounts (sign-in by code stops for them and asks to
 * contact support), and proved numbers with no Telegram-contact or Gateway record behind them (they may
 * have been marked proved by an older rule). The owner decides what to do with each id.
 */
import { PrismaClient } from "@prisma/client";
import { normalizePhone } from "../src/lib/phone";

const prisma = new PrismaClient();

async function main() {
  const proved = await prisma.user.findMany({
    where: { role: "CUSTOMER", deletedAt: null, phoneVerifiedAt: { not: null }, phone: { not: null } },
    select: { id: true, phone: true, active: true, phoneVerifiedAt: true }
  });
  const byNumber = new Map<string, typeof proved>();
  for (const account of proved) {
    const phone = account.phone ? normalizePhone(account.phone) : null;
    if (!phone) continue;
    byNumber.set(phone, [...(byNumber.get(phone) ?? []), account]);
  }
  const shared = [...byNumber.entries()].filter(([, accounts]) => accounts.length > 1);

  const numbers = [...byNumber.keys()];
  const [contactProofs, gatewayProofs] = await Promise.all([
    prisma.phoneVerification.findMany({ where: { status: "SENT", phone: { in: numbers } }, select: { phone: true } }),
    prisma.otpCode.findMany({ where: { providerRef: { not: null }, consumedAt: { not: null }, target: { in: numbers } }, select: { target: true } })
  ]);
  const backed = new Set([...contactProofs.map(row => row.phone), ...gatewayProofs.map(row => row.target)]);
  const unbacked = proved.filter(account => {
    const phone = account.phone ? normalizePhone(account.phone) : null;
    return phone !== null && !backed.has(phone);
  });

  const mask = (phone: string) => `${phone.slice(0, 4)} ** *** ${phone.slice(-4, -2)} ${phone.slice(-2)}`;
  console.log(`Proved customer numbers: ${proved.length}`);
  console.log(`Numbers proved on 2+ accounts: ${shared.length}`);
  for (const [phone, accounts] of shared) console.log(`  ${mask(phone)}: ${accounts.map(account => `${account.id}${account.active ? "" : " (blocked)"}`).join(", ")}`);
  console.log(`Proved without a contact or Gateway record (codes may have been cleaned up, so check by hand): ${unbacked.length}`);
  for (const account of unbacked) console.log(`  ${account.id}`);
}

main()
  .catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
