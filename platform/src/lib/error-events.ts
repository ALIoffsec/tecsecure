import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { escapeTelegramHtml, notifyTelegramAdmins } from "@/lib/telegram";

const ALERT_EVERY_MS = 60 * 60 * 1000;

function clean(text: string, length: number) {
  // Long numbers and tokens would turn one bug into thousands of rows, and may be private.
  return text.replace(/[A-Za-z0-9_-]{24,}/g, "…").replace(/\d{5,}/g, "#").slice(0, length);
}

/** Records a server error once per kind and tells the team on the first sighting. Never throws. */
const VISITOR_LEFT = /destination stream errored|ResponseAborted|ERR_STREAM_PREMATURE_CLOSE|ECONNRESET|socket hang up|^AbortError/i;

export async function recordError(source: string, error: unknown, path?: string): Promise<void> {
  try {
    const message = clean(error instanceof Error ? `${error.name}: ${error.message}` : String(error), 1000);
    if (VISITOR_LEFT.test(message)) return;
    const fingerprint = createHash("sha256").update(`${source}|${message}|${path ?? ""}`).digest("hex");
    const event = await prisma.errorEvent.upsert({
      where: { fingerprint },
      create: { fingerprint, source, message, path: path?.slice(0, 200) },
      update: { count: { increment: 1 }, lastSeenAt: new Date() }
    });
    if (event.alertedAt && Date.now() - event.alertedAt.getTime() < ALERT_EVERY_MS) return;
    await prisma.errorEvent.update({ where: { id: event.id }, data: { alertedAt: new Date() } });
    await notifyTelegramAdmins(
      `<b>⚠️ Saytda xato</b>\nManba: ${escapeTelegramHtml(source)}${path ? `\nSahifa: ${escapeTelegramHtml(path)}` : ""}\nTakror: ${event.count}\n<code>${escapeTelegramHtml(message.slice(0, 500))}</code>`,
      "ERROR-ALERT"
    );
  } catch (issue) {
    console.error("Could not record an error", issue instanceof Error ? issue.message : "UnknownError");
  }
}
