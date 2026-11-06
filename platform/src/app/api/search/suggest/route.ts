import { searchCatalog } from "@/lib/search-index";
import type { Locale } from "@/lib/messages";

export const runtime = "nodejs";

const locales: Locale[] = ["uz", "ru", "en"];

/** Public catalogue data only, answered from a short-lived in-memory index on every keystroke. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const locale = locales.find(item => item === params.get("locale")) ?? "uz";
  const scope = params.get("scope") === "products" ? "products" : "all";
  const perGroup = Math.max(1, Math.min(Number.parseInt(params.get("limit") ?? "5", 10) || 5, 30));
  try {
    const result = await searchCatalog(params.get("q") ?? "", locale, { scope, perGroup });
    return Response.json(result, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch (error) {
    console.error("Search suggestions failed", error);
    return Response.json({ error: "Qidiruv vaqtincha ishlamayapti." }, { status: 500 });
  }
}
