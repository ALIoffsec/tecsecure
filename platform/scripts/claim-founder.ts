import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.FOUNDER_EMAIL ?? process.env.ADMIN_EMAIL)?.trim().toLowerCase();
  if (!email) throw new Error("Set FOUNDER_EMAIL (or ADMIN_EMAIL) to the existing account that should become the founder.");
  const founder = await prisma.$transaction(async (tx) => {
    const existingFounder = await tx.user.findFirst({ where: { role: "FOUNDER" }, select: { id: true, email: true } });
    const target = await tx.user.findUnique({ where: { email }, select: { id: true, email: true, role: true } });
    if (!target) throw new Error("The founder account must already exist.");
    if (existingFounder && existingFounder.id !== target.id) throw new Error(`A different founder is already configured: ${existingFounder.email}`);
    if (target.role !== "ADMIN" && target.role !== "FOUNDER") throw new Error("Only an existing ADMIN account can be claimed as founder.");
    if (target.role !== "FOUNDER") {
      await tx.user.update({ where: { id: target.id }, data: { role: "FOUNDER" } });
      await tx.session.deleteMany({ where: { userId: target.id } });
      await tx.auditLog.create({ data: { action: "FOUNDER_ROLE_CLAIMED", entity: "User", entityId: target.id } });
    }
    return target;
  });
  console.info(`Founder access is configured for ${founder.email}. Sign in again at /staff/login.`);
}

main()
  .catch((error: unknown) => {
    console.error("Founder claim failed", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
