import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { confirmTwoFactor, disableTwoFactor, startTwoFactorSetup, twoFactorStatus } from "@/lib/two-factor";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "private, no-store" };
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }),
  z.object({ action: z.literal("confirm"), code: z.string().trim().min(6).max(10) }),
  z.object({ action: z.literal("disable"), code: z.string().trim().min(6).max(20) })
]);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  return Response.json(await twoFactorStatus(user.id), { headers: noStore });
}

/** Turns two-factor sign-in on (start, then confirm with a code) or off (with a code). */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (!(await checkRateLimit("two-factor-setup", user.id, 20, 15 * 60 * 1000))) {
    return Response.json({ error: "Urinishlar limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "So‘rov noto‘g‘ri." }, { status: 400 });
  try {
    if (parsed.data.action === "start") {
      return Response.json(await startTwoFactorSetup(user.id, user.email.endsWith(".invalid") ? user.name : user.email), { headers: noStore });
    }
    if (parsed.data.action === "confirm") {
      const backupCodes = await confirmTwoFactor(user.id, parsed.data.code);
      if (!backupCodes) return Response.json({ error: "Kod mos kelmadi. Ilovadagi joriy kodni kiriting.", code: "WRONG_CODE" }, { status: 400 });
      return Response.json({ ok: true, backupCodes }, { headers: noStore });
    }
    if (!(await disableTwoFactor(user.id, parsed.data.code))) return Response.json({ error: "Kod mos kelmadi.", code: "WRONG_CODE" }, { status: 400 });
    return Response.json({ ok: true }, { headers: noStore });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_ENABLED") return Response.json({ error: "Ikki bosqichli himoya allaqachon yoqilgan.", code: "ALREADY_ENABLED" }, { status: 409 });
    console.error("Two-factor setup failed", error instanceof Error ? error.message : "UnknownError");
    return Response.json({ error: "Sozlab bo‘lmadi. Qayta urinib ko‘ring." }, { status: 500 });
  }
}
