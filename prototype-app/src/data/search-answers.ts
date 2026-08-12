import type { SearchSeedAnswer } from '../types';

/**
 * Seeded AI answers for the ~6 demo search queries (D4: never "đơ" off-seed —
 * the palette/SearchPage render a soft note + normal results when this misses).
 * Phase 1 ships this EMPTY so the palette is complete without hardcoded answers;
 * Phase 6 fills the array — zero edits to the palette itself.
 */
export const searchSeedAnswers: SearchSeedAnswer[] = [];

export function findSeedAnswer(query: string): SearchSeedAnswer | undefined {
  const q = query.trim().toLocaleLowerCase('vi');
  if (q.length < 2) return undefined;
  return searchSeedAnswers.find((answer) => answer.keywords.some((keyword) => q.includes(keyword.toLocaleLowerCase('vi'))));
}
