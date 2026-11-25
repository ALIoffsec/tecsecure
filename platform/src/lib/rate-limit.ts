import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

/** Counts one attempt in the window and says whether it is still within the limit, and when the window resets. */
export async function rateLimit(
  namespace: string,
  identity: string,
  maximum: number,
  windowMs: number
): Promise<RateLimitResult> {
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

  const current = await prisma.authRateLimit.findUnique({ where: { key }, select: { count: true, resetAt: true } });
  const ok = Boolean(current && current.count <= maximum);
  const retryAfterSeconds = current ? Math.max(1, Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000)) : 1;
  return { ok, retryAfterSeconds };
}

export async function checkRateLimit(
  namespace: string,
  identity: string,
  maximum: number,
  windowMs: number
): Promise<boolean> {
  return (await rateLimit(namespace, identity, maximum, windowMs)).ok;
}

/** The text says in whole minutes when to try again; it is translated by lib/server-messages. */
export function retryMessage(retryAfterSeconds: number): string {
  return `Urinishlar limiti oshdi. ${Math.max(1, Math.ceil(retryAfterSeconds / 60))} daqiqadan so‘ng qayta urinib ko‘ring.`;
}

export function tooManyAttempts(retryAfterSeconds: number, code = "RATE_LIMITED"): Response {
  return Response.json(
    { error: retryMessage(retryAfterSeconds), code, retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
