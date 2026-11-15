import { requireAdminApi } from "@/lib/auth";
import { disputeDecisionSchema } from "@/lib/marketplace";
import { decideDispute } from "@/lib/shop-disputes-server";

export const runtime = "nodejs";

/** Staff decide a complaint: RELEASE pays the shop as usual, REFUND returns the part's money to the buyer. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const parsed = disputeDecisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Qaror va izohni yozing (kamida 3 belgi)." }, { status: 400 });
  const result = await decideDispute((await params).id, parsed.data.action, parsed.data.note, actor.id);
  return result.ok ? Response.json({ ok: true }) : Response.json({ error: result.error }, { status: result.status });
}
