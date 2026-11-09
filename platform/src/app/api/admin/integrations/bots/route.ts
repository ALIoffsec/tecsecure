import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { BotSetupError, botNames, botStatuses, resetWebhook, setMenuButton } from "@/lib/telegram-bots-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ action: z.enum(["webhook", "menu"]), bot: z.enum(botNames) });

/** Webhook health of all three bots, as Telegram reports it. */
export async function GET() {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  return Response.json({ bots: await botStatuses() }, { headers: { "Cache-Control": "private, no-store" } });
}

/** Re-point one bot's webhook at this site, or set its Mini App menu button. */
export async function POST(request: Request) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "So‘rov noto‘g‘ri." }, { status: 400 });
  try {
    if (parsed.data.action === "webhook") return Response.json({ ok: true, status: await resetWebhook(parsed.data.bot) });
    await setMenuButton(parsed.data.bot);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UnknownError";
    if (!(error instanceof BotSetupError)) console.error("Bot setup failed", parsed.data.bot, parsed.data.action, message);
    return Response.json({ error: message }, { status: error instanceof BotSetupError ? 400 : 502 });
  }
}
