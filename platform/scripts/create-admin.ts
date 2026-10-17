import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 16) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 16 characters) in the server environment.");
  }
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new Error("That account already exists; bootstrap will not overwrite its password or role.");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, name: "Tecsecure administrator", passwordHash, role: "ADMIN" }
  });
  console.info(`Created initial admin account for ${email}.`);
}

main()
  .catch((error: unknown) => {
    console.error("Admin bootstrap failed", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
