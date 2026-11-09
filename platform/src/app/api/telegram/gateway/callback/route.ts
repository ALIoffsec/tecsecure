import { prisma } from "@/lib/prisma";
import { gatewayToken, verifyGatewayReport } from "@/lib/telegram-gateway";

export const runtime = "nodejs";

/**
 * Delivery reports from Telegram Gateway. Only reports signed with our token (and fresh) are accepted;
 * a signed report always gets 200 so Telegram stops retrying, even if it names a code we no longer keep.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 16 * 1024) return new Response("Too large", { status: 413 });
  const token = await gatewayToken();
  if (!verifyGatewayReport(token, request.headers.get("x-request-timestamp"), raw, request.headers.get("x-request-signature"))) {
    return new Response("Forbidden", { status: 403 });
  }
  try {
    const report = JSON.parse(raw) as { request_id?: unknown; delivery_status?: { status?: unknown } };
    const status = typeof report.delivery_status?.status === "string" ? report.delivery_status.status.slice(0, 20) : null;
    if (typeof report.request_id === "string" && status) {
      await prisma.otpCode.updateMany({ where: { providerRef: report.request_id }, data: { deliveryStatus: status } });
    }
  } catch (error) {
    console.error("Gateway report could not be stored:", error instanceof Error ? error.message : "UnknownError");
  }
  return new Response("ok", { status: 200 });
}
