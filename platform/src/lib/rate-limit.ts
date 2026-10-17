import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function checkRateLimit(
  namespace: string,
  identity: string,
  maximum: number,
  windowMs: number
): Promise<boolean> {
  const key = createHash("sha256").update(`${namespace}:${identity}`).digest("hex");
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  await prisma.authRateLimit.upsert({
    where: { key },
    create: { key, count: 0, resetAt },
    update: {}
  });
  const reset = await prisma.authRateLimit.updateMany({
    where: { key, resetAt: { lte: now } },
    data: { count: 1, resetAt }
  });
  if (reset.count === 0) {
    await prisma.authRateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  }

  const current = await prisma.authRateLimit.findUnique({ where: { key }, select: { count: true } });
  return Boolean(current && current.count <= maximum);
}
