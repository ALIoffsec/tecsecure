import { requireAdminApi } from "@/lib/auth";
import { connectTelegramBot } from "@/lib/telegram";

export const runtime = "nodejs";

export async function POST() {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  try {
    return Response.json(await connectTelegramBot());
  } catch (error) {
    console.error("Telegram connection test failed", error instanceof Error ? error.message : "UnknownError");
    return Response.json({ error: "Botga ulanib bo‘lmadi. Token va chat ID ni tekshiring." }, { status: 502 });
  }
}
