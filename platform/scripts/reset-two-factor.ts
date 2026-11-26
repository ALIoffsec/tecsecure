/**
 * Turns two-factor off for one account, from the server. For the founder (whom the admin panel cannot reset)
 * or when no admin can sign in. Ends every session and open sign-in ticket of that account.
 *
 *   npm run 2fa:reset -- <email> "<reason>"
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const reason = process.argv.slice(3).join(" ").trim();
  if (!email || reason.length < 3) throw new Error('Usage: npm run 2fa:reset -- <email> "<reason>"');
  const account = await prisma.user.findUnique({ where: { email }, select: { id: true, phone: true, twoFactorEnabledAt: true, deletedAt: true } });
  if (!account || account.deletedAt) throw new Error("No account exists for that email.");
  if (!account.twoFactorEnabledAt) throw new Error("Two-factor is not on for that account.");
  const contacts = [email, account.phone].filter((value): value is string => Boolean(value));
  await prisma.$transaction([
    prisma.user.update({ where: { id: account.id }, data: { twoFactorSecret: null, twoFactorEnabledAt: null, twoFactorBackupCodes: [], twoFactorLastStep: null } }),
    prisma.session.deleteMany({ where: { userId: account.id } }),
    prisma.otpCode.updateMany({
      where: {
        consumedAt: null,
        OR: [
          { purpose: "TWO_FACTOR", target: { startsWith: `${account.id}:` } },
          { purpose: { startsWith: "REAUTH" }, target: { startsWith: `reauth:${account.id}:` } },
          { purpose: { in: ["RESET_TICKET", "PHONE_CLAIM"] }, target: { in: contacts } }
        ]
      },
      data: { consumedAt: new Date() }
    }),
    prisma.auditLog.create({ data: { actorId: null, action: "TWO_FACTOR_RESET", entity: "User", entityId: account.id, metadata: { via: "script", reason } } })
  ]);
  console.log("Two-factor is off and every session of that account has ended. Ask the person to sign in and turn it on again.");
}

main()
  .catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
