import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { RECEIPT_UPLOADS_PER_HOUR } from "@/lib/order-refunds";
import { reuploadReceipt } from "@/lib/order-refunds-server";

export const runtime = "nodejs";

const bodySchema = z.object({ mediaId: z.string().min(1).max(40) });

/** The buyer sends a new card-transfer receipt after staff refused the first one. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Hisobga kiring." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Chek rasmini tanlang." }, { status: 400 });
  const limit = await rateLimit("order-proof", user.id, RECEIPT_UPLOADS_PER_HOUR, 60 * 60 * 1000);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);
  const result = await reuploadReceipt(user.id, (await params).id, parsed.data.mediaId);
  return result.ok ? Response.json({ ok: true }) : Response.json({ error: result.error, code: result.code }, { status: result.status });
}
