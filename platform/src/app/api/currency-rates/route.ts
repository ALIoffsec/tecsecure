import { parseCbuRates } from "@/lib/currency";

export const dynamic = "force-dynamic";

const ratesUrl = "https://cbu.uz/uz/arkhiv-kursov-valyut/json/";

export async function GET() {
  try {
    const response = await fetch(ratesUrl, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`Markaziy bank so‘rovi muvaffaqiyatsiz: ${response.status}`);
    const rates = parseCbuRates(await response.json());
    return Response.json(rates, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=43200" }
    });
  } catch (error) {
    console.error("Currency rate lookup failed", error);
    return Response.json(
      { error: "Valyuta kurslarini hozircha yuklab bo‘lmadi." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
