import { getCurrentUser } from "@/lib/auth";
import { disputeSchema } from "@/lib/marketplace";
import { checkRateLimit } from "@/lib/rate-limit";
import { openDispute } from "@/lib/shop-disputes-server";

export const runtime = "nodejs";

/** The buyer reports that a shop's parcel did not arrive or was wrong; the shop's money waits for staff. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Hisobga kiring." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "Faqat mijoz hisobi uchun." }, { status: 403 });
  if (!(await checkRateLimit("order-dispute", user.id, 10, 24 * 60 * 60 * 1000))) return Response.json({ error: "Juda ko‘p so‘rov. Ertaga urinib ko‘ring." }, { status: 429 });
  const parsed = disputeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Muammoni kamida 5 belgida yozing." }, { status: 400 });
  const result = await openDispute(user.id, (await params).id, parsed.data.shopId, parsed.data.note);
  return result.ok ? Response.json({ ok: true }) : Response.json({ error: result.error, code: result.code }, { status: result.status });
}
