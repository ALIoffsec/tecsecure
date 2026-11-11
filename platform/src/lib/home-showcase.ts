/**
 * Which products the home page shows: one per category, the kinds people come for first (cameras, switches,
 * routers, recorders), and names already written in Uzbek before ones that exist only in Russian.
 */
const preferred = [/kamera|camera/i, /kommutator|switch/i, /router|marshrut|tarmoq|network/i, /registrator|nvr|recorder/i, /wi-?fi|access|kirish nuqta/i];
const cyrillic = /[Ѐ-ӿ]/;

type Candidate = { id: string; name: string; category: { name: string; slug: string } | null };

function rank(product: Candidate): number {
  const label = `${product.category?.name ?? ""} ${product.category?.slug ?? ""} ${product.name}`;
  const index = preferred.findIndex(pattern => pattern.test(label));
  return index === -1 ? preferred.length : index;
}

export function pickShowcase<P extends Candidate>(products: P[], count: number): P[] {
  const ordered = [...products].sort((a, b) => Number(cyrillic.test(a.name)) - Number(cyrillic.test(b.name)) || rank(a) - rank(b));
  const chosen: P[] = [];
  const categories = new Set<string>();
  for (const product of ordered) {
    const key = product.category?.slug ?? `none:${product.id}`;
    if (categories.has(key)) continue;
    categories.add(key);
    chosen.push(product);
    if (chosen.length === count) return chosen;
  }
  // Fewer categories than places: fill up with the next best, still without repeats.
  for (const product of ordered) {
    if (chosen.length === count) break;
    if (!chosen.includes(product)) chosen.push(product);
  }
  return chosen;
}
