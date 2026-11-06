import { handlePaymeMethod, paymeAuthorized, PaymeError } from "@/lib/payme";

export const runtime = "nodejs";

type RpcError = { code: number; message: { ru: string; uz: string; en: string }; data?: string };

/** Payme expects HTTP 200 for every answer; the outcome travels inside the JSON-RPC body. */
function reply(id: unknown, body: { result: unknown } | { error: RpcError }) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, ...body });
}

export async function POST(request: Request) {
  let payload: { id?: unknown; method?: unknown; params?: unknown };
  try {
    payload = await request.json();
  } catch {
    return reply(null, { error: { code: -32700, message: { ru: "Ошибка разбора JSON", uz: "JSON xatosi", en: "JSON parse error" } } });
  }
  if (!paymeAuthorized(request.headers.get("authorization"), process.env.PAYME_KEY)) {
    return reply(payload.id, { error: { code: -32504, message: { ru: "Недостаточно привилегий", uz: "Ruxsat yetarli emas", en: "Insufficient privileges" } } });
  }
  if (typeof payload.method !== "string" || typeof payload.params !== "object" || payload.params === null) {
    return reply(payload.id, { error: { code: -32600, message: { ru: "Неверный запрос", uz: "So‘rov noto‘g‘ri", en: "Invalid request" } } });
  }
  try {
    return reply(payload.id, { result: await handlePaymeMethod(payload.method, payload.params) });
  } catch (error) {
    if (error instanceof PaymeError) {
      return reply(payload.id, { error: { code: error.code, message: { ru: error.ru, uz: error.uz, en: error.en }, ...(error.data ? { data: error.data } : {}) } });
    }
    console.error("Payme request failed", error);
    return reply(payload.id, { error: { code: -32400, message: { ru: "Системная ошибка", uz: "Tizim xatosi", en: "System error" } } });
  }
}
