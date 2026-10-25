import { getYandexMapsCredentials } from "@/lib/integration-credentials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { apiKey } = await getYandexMapsCredentials();
    return Response.json({ apiKey }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Public map configuration read failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Xarita sozlamasini yuklab bo‘lmadi." }, { status: 500 });
  }
}
