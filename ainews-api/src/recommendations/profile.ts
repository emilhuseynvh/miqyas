import { extractKeywords } from './keywords.js';

export const SIGNAL_WEIGHTS = {
  read: 1,
  explorationRead: 2,
  like: 3,
  save: 4,
  dislike: -4,
  hide: -6,
  explicit: 10,
  ignoredImpression: -0.2,
};

export const LONG_TERM_HALF_LIFE_HOURS = 14 * 24;
export const SHORT_TERM_HALF_LIFE_HOURS = 6;
export const LONG_TERM_SHARE = 0.6;
export const FULL_CONFIDENCE_SIGNALS = 10;
export const EXPLORE_RATE_NEW = 0.3;
export const EXPLORE_RATE_MATURE = 0.15;
export const MATURE_SIGNALS = 50;

export type Signal = {
  weight: number;
  at: Date;
  categoryId: number | null;
  sourceId: string;
  title: string;
};

export type IgnoredImpression = {
  categoryId: number | null;
  shownCount: number;
  lastShownAt: Date;
};

export type InterestProfile = {
  categories: Map<number, number>;
  longTermCategories: Map<number, number>;
  shortTermCategories: Map<number, number>;
  sources: Map<string, number>;
  keywords: Map<string, number>;
  keywordLabels: Map<string, string>;
  explicit: Set<number>;
  signals: number;
  exploreEvery: number;
};

type Layer<K> = { long: Map<K, number>; short: Map<K, number> };

const layer = <K>(): Layer<K> => ({ long: new Map(), short: new Map() });

const decay = (at: Date, now: number, halfLifeHours: number) =>
  0.5 ** (Math.max(0, now - at.getTime()) / 3_600_000 / halfLifeHours);

function add<K>(target: Layer<K>, key: K, weight: number, at: Date, now: number) {
  target.long.set(
    key,
    (target.long.get(key) ?? 0) + weight * decay(at, now, LONG_TERM_HALF_LIFE_HOURS),
  );
  target.short.set(
    key,
    (target.short.get(key) ?? 0) + weight * decay(at, now, SHORT_TERM_HALF_LIFE_HOURS),
  );
}

export function normalize<K>(raw: Map<K, number>): Map<K, number> {
  const max = Math.max(0, ...[...raw.values()].map(Math.abs));
  if (max === 0) return new Map();
  return new Map([...raw].map(([key, value]) => [key, value / max]));
}

const SHORT_TERM_MIN = 0.05;

function combine<K>(target: Layer<K>, confidence: number) {
  const long = normalize(target.long);
  const short = normalize(
    new Map([...target.short].filter(([, value]) => Math.abs(value) >= SHORT_TERM_MIN)),
  );
  const keys = new Set([...long.keys(), ...short.keys()]);
  const combined = new Map<K, number>();
  for (const key of keys) {
    const value =
      short.size === 0
        ? (long.get(key) ?? 0)
        : LONG_TERM_SHARE * (long.get(key) ?? 0) + (1 - LONG_TERM_SHARE) * (short.get(key) ?? 0);
    combined.set(key, value * confidence);
  }
  return { combined, long, short };
}

export function exploreEvery(signals: number): number {
  const maturity = Math.min(1, signals / MATURE_SIGNALS);
  const rate = EXPLORE_RATE_NEW - (EXPLORE_RATE_NEW - EXPLORE_RATE_MATURE) * maturity;
  return Math.max(2, Math.round(1 / rate));
}

export function buildProfile(
  signals: Signal[],
  ignored: IgnoredImpression[],
  explicit: Set<number>,
  now: number,
): InterestProfile {
  const categories = layer<number>();
  const sources = layer<string>();
  const keywords = layer<string>();
  const labels = new Map<string, string>();

  for (const signal of signals) {
    if (signal.categoryId !== null)
      add(categories, signal.categoryId, signal.weight, signal.at, now);
    add(sources, signal.sourceId, signal.weight, signal.at, now);
    for (const token of extractKeywords(signal.title)) {
      add(keywords, token.stem, signal.weight, signal.at, now);
      const current = labels.get(token.stem);
      if (!current || token.word.length < current.length) labels.set(token.stem, token.word);
    }
  }

  for (const impression of ignored) {
    if (impression.categoryId === null) continue;
    const penalty = SIGNAL_WEIGHTS.ignoredImpression * impression.shownCount;
    categories.long.set(
      impression.categoryId,
      (categories.long.get(impression.categoryId) ?? 0) +
        penalty * decay(impression.lastShownAt, now, LONG_TERM_HALF_LIFE_HOURS),
    );
  }

  for (const id of explicit) {
    categories.long.set(id, (categories.long.get(id) ?? 0) + SIGNAL_WEIGHTS.explicit);
  }

  const confidence = explicit.size > 0 ? 1 : Math.min(1, signals.length / FULL_CONFIDENCE_SIGNALS);
  const category = combine(categories, confidence);

  return {
    categories: category.combined,
    longTermCategories: category.long,
    shortTermCategories: category.short,
    sources: combine(sources, confidence).combined,
    keywords: combine(keywords, confidence).combined,
    keywordLabels: labels,
    explicit,
    signals: signals.length,
    exploreEvery: exploreEvery(signals.length),
  };
}

export function emptyProfile(): InterestProfile {
  return {
    categories: new Map(),
    longTermCategories: new Map(),
    shortTermCategories: new Map(),
    sources: new Map(),
    keywords: new Map(),
    keywordLabels: new Map(),
    explicit: new Set(),
    signals: 0,
    exploreEvery: exploreEvery(0),
  };
}
