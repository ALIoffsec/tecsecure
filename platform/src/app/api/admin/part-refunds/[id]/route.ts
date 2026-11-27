import { z } from "zod";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { REFUND_DOCUMENT } from "@/lib/order-refunds";
import { markPartRefunded } from "@/lib/order-refunds-server";

export const runtime = "nodejs";

const bodySchema = z.object({
  document: z.string().trim().min(REFUND_DOCUMENT.min).max(REFUND_DOCUMENT.max),
  // Whole so‘m only: the field takes digits, so a misread separator cannot slip through.
  amountMinor: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).refine(value => value % 100 === 0).optional(),
  note: z.string().trim().max(300).optional()
});

/** Staff record that one part's refund owed by hand was paid out. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireModuleApi("PAYMENTS");
  if (isResponse(actor)) return actor;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Hujjat raqamini 2–120 belgida yozing." }, { status: 400 });
  const result = await markPartRefunded((await params).id, parsed.data, actor.id);
  return result.ok ? Response.json({ ok: true }) : Response.json({ error: result.error, code: result.code }, { status: result.status });
}
