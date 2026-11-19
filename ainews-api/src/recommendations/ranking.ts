import { keywordStems } from './keywords.js';
import type { InterestProfile } from './profile.js';

export const WEIGHTS = {
  category: 0.3,
  source: 0.1,
  keyword: 0.15,
  popularity: 0.2,
  freshness: 0.25,
};
export const EXPLORE_MAX_INTEREST = 0.2;
export const MAX_SAME_CATEGORY_IN_ROW = 2;
export const UNIQUE_SOURCE_WINDOW = 10;
export const FRESHNESS_HALF_LIFE_HOURS = 12;

export type Candidate = {
  id: string;
  title: string;
  categoryId: number | null;
  sourceId: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
};

export type ScoreParts = {
  category: number;
  source: number;
  keyword: number;
  keywordStem: string | null;
  popularity: number;
  freshness: number;
};

export type Scored = Candidate & { score: number; parts: ScoreParts };

export type Ranked = Scored & { exploration: boolean };

export function wilsonLowerBound(positive: number, negative: number): number {
  const n = positive + negative;
  if (n === 0) return 0;
  const z = 1.96;
  const p = positive / n;
  return (
    (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) /
    (1 + (z * z) / n)
  );
}

export function freshness(publishedAt: Date, now: number): number {
  const ageHours = Math.max(0, (now - publishedAt.getTime()) / 3_600_000);
  return 0.5 ** (ageHours / FRESHNESS_HALF_LIFE_HOURS);
}

function inverseDocumentFrequency(titles: string[][]): Map<string, number> {
  const df = new Map<string, number>();
  for (const stems of titles) for (const stem of stems) df.set(stem, (df.get(stem) ?? 0) + 1);
  const n = Math.max(2, titles.length);
  const scale = Math.log(n);
  return new Map([...df].map(([stem, count]) => [stem, Math.max(0, Math.log(n / count) / scale)]));
}

function keywordMatch(stems: string[], profile: InterestProfile, idf: Map<string, number>) {
  let best = 0;
  let bestStem: string | null = null;
  for (const stem of stems) {
    const value = (profile.keywords.get(stem) ?? 0) * (idf.get(stem) ?? 0);
    if (Math.abs(value) > Math.abs(best)) {
      best = value;
      bestStem = stem;
    }
  }
  return { keyword: best, keywordStem: bestStem };
}

export function scoreCandidates(
  candidates: Candidate[],
  profile: InterestProfile,
  now: number,
): Scored[] {
  const stems = candidates.map((candidate) => keywordStems(candidate.title));
  const idf = inverseDocumentFrequency(stems);
  const viewScale = Math.log1p(Math.max(0, ...candidates.map((c) => c.viewCount)));

  return candidates
    .map((candidate, i) => {
      const parts: ScoreParts = {
        category:
          candidate.categoryId === null ? 0 : (profile.categories.get(candidate.categoryId) ?? 0),
        source: profile.sources.get(candidate.sourceId) ?? 0,
        ...keywordMatch(stems[i], profile, idf),
        popularity:
          0.7 * (viewScale > 0 ? Math.log1p(candidate.viewCount) / viewScale : 0) +
          0.3 * wilsonLowerBound(candidate.likeCount, candidate.dislikeCount),
        freshness: freshness(candidate.publishedAt, now),
      };
      const score =
        WEIGHTS.category * parts.category +
        WEIGHTS.source * parts.source +
        WEIGHTS.keyword * parts.keyword +
        WEIGHTS.popularity * parts.popularity +
        WEIGHTS.freshness * parts.freshness;
      return { ...candidate, parts, score };
    })
    .sort((a, b) => b.score - a.score);
}

function fitsDiversity(item: Scored, picked: Ranked[]): boolean {
  const lastCategories = picked.slice(-MAX_SAME_CATEGORY_IN_ROW).map((p) => p.categoryId);
  const repeatsCategory =
    lastCategories.length === MAX_SAME_CATEGORY_IN_ROW &&
    lastCategories.every((id) => id === item.categoryId);
  const repeatsSource =
    picked.at(-1)?.sourceId === item.sourceId ||
    (picked.length < UNIQUE_SOURCE_WINDOW && picked.some((p) => p.sourceId === item.sourceId));
  return !repeatsCategory && !repeatsSource;
}

export function rerank(scored: Scored[], limit: number, exploreEvery: number): Ranked[] {
  const explorePool = scored
    .filter(
      (item) =>
        item.categoryId !== null &&
        item.parts.category >= 0 &&
        item.parts.category < EXPLORE_MAX_INTEREST,
    )
    .sort(
      (a, b) => b.parts.popularity + b.parts.freshness - (a.parts.popularity + a.parts.freshness),
    );
  const used = new Set<string>();
  const picked: Ranked[] = [];

  const explored = new Set<number | null>();

  const take = (pool: Scored[], exploration: boolean) => {
    const available = pool.filter((item) => !used.has(item.id));
    const choice =
      (exploration
        ? available.find((item) => !explored.has(item.categoryId) && fitsDiversity(item, picked))
        : undefined) ??
      available.find((item) => fitsDiversity(item, picked)) ??
      available[0];
    if (!choice) return false;
    used.add(choice.id);
    if (exploration) explored.add(choice.categoryId);
    picked.push({ ...choice, exploration });
    return true;
  };

  while (picked.length < limit && used.size < scored.length) {
    const exploreSlot = picked.length % exploreEvery === exploreEvery - 1;
    if (exploreSlot && take(explorePool, true)) continue;
    if (!take(scored, false)) break;
  }
  return picked;
}
