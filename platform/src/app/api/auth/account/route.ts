import { destroySession, getCurrentUser } from "@/lib/auth";
import { requireReauth } from "@/lib/reauth";
import { anonymizeAccount } from "@/lib/account-anonymize";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({ password: z.string().max(128).optional() });

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") {
    return Response.json({ error: "Xodim akkauntlarini o‘z-o‘ziga xizmat orqali o‘chirib bo‘lmaydi." }, { status: 403 });
  }
  if (!(await checkRateLimit("account-delete", user.id, 5, 60 * 60 * 1000))) {
    return Response.json({ error: "Urinishlar limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Joriy parol talab qilinadi." }, { status: 400 });
  // The confirmation window, or (without two-factor) the current password typed in the form as before.
  const confirmed = await requireReauth(user, "DELETE", parsed.data.password || undefined);
  if (confirmed instanceof Response) return confirmed;

  try {
    // The account is anonymised, not deleted: orders, payments and certificates stay with the company's records.
    const result = await anonymizeAccount(user.id, user.id);
    if (!result.ok && "blockers" in result) {
      return Response.json({ error: "Hisobni hozir o‘chirib bo‘lmaydi.", code: "DELETE_BLOCKED", blockers: result.blockers }, { status: 409 });
    }
    if (!result.ok) return Response.json({ error: "Hisob holati o‘zgardi. Qayta urinib ko‘ring." }, { status: 409 });
    await destroySession();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Account deletion failed", error instanceof Error ? error.message : "UnknownError");
    return Response.json({ error: "Akkauntni o‘chirib bo‘lmadi." }, { status: 500 });
  }
}
