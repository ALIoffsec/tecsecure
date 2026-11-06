import { SearchResults } from "@/components/search-results";

export const dynamic = "force-dynamic";
export const metadata = { title: "Qidiruv | Tecsecure", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const raw = (await searchParams).q;
  const q = typeof raw === "string" ? raw.trim().slice(0, 80) : "";
  return <SearchResults key={q} query={q} />;
}
