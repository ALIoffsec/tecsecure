import { countOtherSessions, endOtherSessions, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { revokeOpenTickets } from "@/lib/two-factor";

export const runtime = "nodejs";

/** How many other devices are signed in to this account. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  return Response.json({ others: await countOtherSessions(user.id) }, { headers: { "Cache-Control": "no-store" } });
}

/** Signs out every other device; this one stays signed in. */
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const limited = await rateLimit("sessions-end-others", user.id, 10, 60 * 60 * 1000);
  if (!limited.ok) return tooManyAttempts(limited.retryAfterSeconds);
  const ended = await endOtherSessions(user.id);
  if (ended === null) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  await revokeOpenTickets(user.id);
  await prisma.auditLog.create({ data: { actorId: user.id, action: "OTHER_SESSIONS_ENDED", entity: "User", entityId: user.id, metadata: { count: ended } } });
  return Response.json({ ok: true, ended });
}
