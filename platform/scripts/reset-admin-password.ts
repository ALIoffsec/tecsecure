import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function readHidden(prompt: string): Promise<string> {
  const input = process.stdin;
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    throw new Error("Run this command directly in an interactive VPS terminal.");
  }

  process.stdout.write(prompt);
  input.setEncoding("utf8");
  input.setRawMode(true);
  input.resume();

  return new Promise((resolve, reject) => {
    let value = "";
    const cleanup = () => {
      input.removeListener("data", onData);
      input.setRawMode(false);
      input.pause();
      process.stdout.write("\n");
    };
    const onData = (key: string) => {
      if (key === "\u0003") {
        cleanup();
        reject(new Error("Password reset cancelled."));
      } else if (key === "\r" || key === "\n") {
        cleanup();
        resolve(value);
      } else if (key === "\u007f" || key === "\b") {
        value = value.slice(0, -1);
      } else if (key >= " ") {
        value += key;
      }
    };
    input.on("data", onData);
  });
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error("Usage: npm run admin:password-reset -- <admin-email>");
  }

  const account = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, active: true }
  });
  if (!account || (account.role !== "ADMIN" && account.role !== "FOUNDER")) {
    throw new Error("No administrator or founder account exists for that email.");
  }
  if (!account.active) {
    throw new Error("That account is disabled. Enable it before resetting its password.");
  }

  const password = await readHidden("New password (16+ characters): ");
  if (password.length < 16 || password.length > 128) {
    throw new Error("Password must be between 16 and 128 characters.");
  }
  const confirmation = await readHidden("Repeat new password: ");
  if (password !== confirmation) {
    throw new Error("The passwords do not match.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: account.id }, data: { passwordHash } }),
    prisma.session.deleteMany({ where: { userId: account.id } }),
    prisma.auditLog.create({
      data: {
        actorId: account.id,
        action: "PASSWORD_RESET_VPS",
        entity: "User",
        entityId: account.id
      }
    })
  ]);
  console.info(`Password reset completed for ${account.email}. All existing sessions were revoked.`);
}

main()
  .catch((error: unknown) => {
    console.error("Admin password reset failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
