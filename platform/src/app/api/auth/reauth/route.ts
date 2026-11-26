import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { confirmReauth, reauthOptions, REAUTH_ACTIONS, sendReauthCode } from "@/lib/reauth";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "private, no-store" };
const actionField = z.enum(REAUTH_ACTIONS);
const schema = z.discriminatedUnion("step", [
  z.object({ step: z.literal("send"), action: actionField, method: z.enum(["telegram", "phone", "email"]) }),
  z.object({
    step: z.literal("confirm"), action: actionField, method: z.enum(["password", "totp", "telegram", "phone", "email", "recent"]),
    password: z.string().max(128).optional(), code: z.string().trim().max(20).optional()
  })
]);

/** Which ways of confirming are offered to this person. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const options = await reauthOptions(user);
  if (!options) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  return Response.json(options, { headers: noStore });
}

/** Sends a confirmation code, or checks the proof and records a ten-minute, one-time approval. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const limited = await rateLimit("reauth", user.id, 10, 15 * 60 * 1000);
  if (!limited.ok) return tooManyAttempts(limited.retryAfterSeconds);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "So‘rov noto‘g‘ri." }, { status: 400 });
  if (parsed.data.step === "send") {
    const sent = await sendReauthCode(user, parsed.data.action, parsed.data.method);
    if (!sent) return Response.json({ error: "Kodni yuborib bo‘lmadi. Keyinroq urinib ko‘ring.", code: "SEND_FAILED" }, { status: 502 });
    return Response.json({ ok: true });
  }
  const { action, method, password, code } = parsed.data;
  if (!(await confirmReauth(user, action, { method, password, code }))) {
    return Response.json({ error: method === "password" ? "Joriy parol noto‘g‘ri." : "Kod noto‘g‘ri yoki muddati tugagan.", code: "REAUTH_FAILED" }, { status: 401 });
  }
  return Response.json({ ok: true });
}
