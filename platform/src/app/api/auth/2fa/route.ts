import { clientIp } from "@/lib/client-ip";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { completeSignIn } from "@/lib/two-factor";

export const runtime = "nodejs";

const schema = z.object({ ticket: z.string().min(20).max(100), code: z.string().trim().min(6).max(20) });

/** Second step of a sign-in for accounts with two-factor: the authenticator code or a backup code. */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!(await checkRateLimit("two-factor", ip, 20, 15 * 60 * 1000))) {
    return Response.json({ error: "Urinishlar limiti oshdi. 15 daqiqadan so‘ng qayta urinib ko‘ring." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Kod noto‘g‘ri.", code: "WRONG_CODE" }, { status: 400 });
  const result = await completeSignIn(parsed.data.ticket, parsed.data.code);
  if (!result.ok) {
    return result.reason === "expired"
      ? Response.json({ error: "Kirish vaqti tugadi. Qaytadan kiring.", code: "TICKET_EXPIRED" }, { status: 401 })
      : Response.json({ error: "Kod noto‘g‘ri.", code: "WRONG_CODE" }, { status: 401 });
  }
  const staff = result.role === "ADMIN" || result.role === "FOUNDER" || result.role === "STAFF";
  return Response.json({ ok: true, next: staff ? "/admin" : result.role === "SELLER" ? "/seller" : "/portal" });
}
