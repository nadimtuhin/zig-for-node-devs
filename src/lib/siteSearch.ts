export interface SearchEntry {
  kind: 'lesson' | 'guide';
  href: string;
  title: string;
  /** Chapter number for lessons, "Guide" for architecture guides. */
  label: string;
  summary: string;
}

/** Treats "c-interop", "c_interop" and "C Interop" as the same words. */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[-_/]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function matchScore(entry: SearchEntry, words: string[]): number {
  const title = normalize(entry.title);
  const everything = normalize(`${entry.title} ${entry.href} ${entry.summary}`);
  if (!words.every((word) => everything.includes(word))) return 0;
  const titleHits = words.filter((word) => title.includes(word)).length;
  return 1 + titleHits;
}

/**
 * Every query word must appear somewhere in the entry; entries with more of the
 * words in their title rank first, and ties keep book order.
 * Example: "arena allocator" ranks "Arena Allocator" above a lesson that only
 * mentions arenas in its summary.
 */
export function searchEntries(entries: SearchEntry[], query: string, limit = 12): SearchEntry[] {
  const words = normalize(query).split(' ').filter(Boolean);
  if (words.length === 0) return [];
  return entries
    .map((entry, order) => ({ entry, order, score: matchScore(entry, words) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((hit) => hit.entry);
}
