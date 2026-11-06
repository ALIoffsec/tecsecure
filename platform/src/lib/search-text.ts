/**
 * Search matching. People type the same word many ways here: Cyrillic or Latin, with or without the
 * Uzbek apostrophe, "hizmat" or "xizmat", "komutator" or "kommutator". Everything is folded to one
 * spelling first, so the matching rules below only have to deal with real differences.
 */
const cyrillic: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya", қ: "q", ғ: "g", ў: "o", ҳ: "h"
};

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[а-яёқғўҳ]/g, letter => cyrillic[letter] ?? letter)
    .replace(/[‘’ʻʼ`'´]/g, "")
    .replace(/ch/g, "\u0001")
    .replace(/kh/g, "h")
    .replace(/c/g, "k")
    .replace(/x/g, "h")
    .replace(/w/g, "v")
    .replace(/\u0001/g, "ch")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/([a-z])\1+/g, "$1")
    .trim();
}

export function searchTokens(text: string): string[] {
  const normalized = normalizeSearchText(text);
  return normalized ? normalized.split(" ") : [];
}

/** Optimal string alignment distance, giving up as soon as it passes the limit. */
export function editDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let before: number[] = [];
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) value = Math.min(value, before[j - 2] + 1);
      current[j] = value;
      if (value < best) best = value;
    }
    if (best > limit) return limit + 1;
    before = previous;
    previous = current;
  }
  return previous[b.length];
}

/** How well one typed word fits one indexed word: 0 means not at all. */
function wordScore(typed: string, word: string, stillTyping: boolean): number {
  if (word === typed) return 1;
  if (word.startsWith(typed)) return stillTyping ? .88 : .72;
  if (typed.length < 3) return 0;
  if (word.includes(typed)) return .55;
  if (typed.length < 4) return 0;
  const allowed = typed.length >= 7 ? 2 : 1;
  if (editDistance(typed, word, allowed) <= allowed) return .5;
  if (stillTyping && word.length > typed.length && editDistance(typed, word.slice(0, typed.length), allowed) <= allowed) return .42;
  return 0;
}

export type SearchFields = { title: string; keywords?: string; body?: string };
export type PreparedSearchDocument = { title: string[]; titleCompact: string; keywords: string[]; body: string[] };

export function prepareSearchDocument({ title, keywords = "", body = "" }: SearchFields): PreparedSearchDocument {
  const titleWords = searchTokens(title);
  return { title: titleWords, titleCompact: titleWords.join(""), keywords: searchTokens(keywords), body: searchTokens(body).slice(0, 60) };
}

/** Every typed word has to match somewhere; the title counts most. Zero means no match. */
export function scoreSearchDocument(query: string[], doc: PreparedSearchDocument): number {
  if (!query.length) return 0;
  let total = 0;
  for (const [index, typed] of query.entries()) {
    const stillTyping = index === query.length - 1;
    let best = 0;
    for (const word of doc.title) best = Math.max(best, wordScore(typed, word, stillTyping) * 3);
    // "wifi" should find "Wi-Fi", which is two words once folded.
    if (best === 0 && typed.length >= 3 && doc.titleCompact.includes(typed)) best = 1.8;
    for (const word of doc.keywords) best = Math.max(best, wordScore(typed, word, stillTyping) * 1.6);
    if (best === 0) for (const word of doc.body) best = Math.max(best, wordScore(typed, word, stillTyping) * .7);
    if (best === 0) return 0;
    total += best;
  }
  const opening = query.join(" ");
  if (doc.title.join(" ").startsWith(opening)) total += 1.5;
  return total;
}

/**
 * Whole phrases to offer while someone is still typing: from the word they are on, up to three words
 * of a matching title, kept after whatever they have already finished typing.
 */
export function completionsFor(rawQuery: string, titles: string[], limit = 5): string[] {
  const query = searchTokens(rawQuery);
  if (!query.length) return [];
  const last = query[query.length - 1];
  const finished = rawQuery.trim().split(/\s+/).slice(0, -1).join(" ");
  const seen = new Set<string>([normalizeSearchText(rawQuery)]);
  const out: string[] = [];
  for (const title of titles) {
    const words = title.split(/\s+/).filter(Boolean);
    const start = words.findIndex(word => {
      const folded = normalizeSearchText(word);
      return folded.startsWith(last) || (last.length >= 3 && folded.includes(last)) || (last.length >= 4 && editDistance(last, folded.slice(0, last.length), 1) <= 1);
    });
    if (start < 0) continue;
    for (const size of [1, 2, 3]) {
      const phrase = words.slice(start, start + size).join(" ").replace(/[.,:;()]+$/, "");
      const suggestion = `${finished ? `${finished} ` : ""}${phrase}`.toLocaleLowerCase();
      const key = normalizeSearchText(suggestion);
      if (start + size > words.length || seen.has(key)) continue;
      seen.add(key);
      out.push(suggestion);
      if (out.length >= limit) return out;
    }
  }
  return out;
}
