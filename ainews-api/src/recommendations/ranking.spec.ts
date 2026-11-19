import { describe, expect, it } from 'vitest';
import { emptyProfile, type InterestProfile } from './profile.js';
import { type Candidate, freshness, rerank, scoreCandidates, wilsonLowerBound } from './ranking.js';

const NOW = Date.parse('2026-11-18T12:00:00Z');
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000);

const candidate = (id: string, overrides: Partial<Candidate> = {}): Candidate => ({
  id,
  title: `Xəbər ${id}`,
  categoryId: 1,
  sourceId: `source-${id}`,
  publishedAt: hoursAgo(1),
  viewCount: 0,
  likeCount: 0,
  dislikeCount: 0,
  ...overrides,
});

const profile = (overrides: Partial<InterestProfile> = {}): InterestProfile => ({
  ...emptyProfile(),
  signals: 20,
  ...overrides,
});

describe('wilsonLowerBound', () => {
  it('ranks many likes above a couple of likes', () => {
    expect(wilsonLowerBound(200, 10)).toBeGreaterThan(wilsonLowerBound(2, 0));
  });

  it('is zero without reactions', () => {
    expect(wilsonLowerBound(0, 0)).toBe(0);
  });
});

describe('freshness', () => {
  it('halves every 12 hours', () => {
    expect(freshness(hoursAgo(0), NOW)).toBeCloseTo(1);
    expect(freshness(hoursAgo(12), NOW)).toBeCloseTo(0.5);
    expect(freshness(hoursAgo(24), NOW)).toBeCloseTo(0.25);
  });
});

describe('scoreCandidates', () => {
  it('prefers the category the reader likes', () => {
    const scored = scoreCandidates(
      [candidate('politics', { categoryId: 2 }), candidate('sport', { categoryId: 1 })],
      profile({ categories: new Map([[1, 1]]) }),
      NOW,
    );
    expect(scored[0].id).toBe('sport');
  });

  it('pushes disliked categories down', () => {
    const scored = scoreCandidates(
      [candidate('disliked', { categoryId: 3 }), candidate('neutral', { categoryId: 4 })],
      profile({ categories: new Map([[3, -1]]) }),
      NOW,
    );
    expect(scored.at(-1)?.id).toBe('disliked');
  });

  it('boosts headlines that share a followed keyword', () => {
    const pool = [
      candidate('match', { title: 'Qarabağ Avropada növbəti oyununa çıxır' }),
      candidate('other', { title: 'Neftçi məşqçisini dəyişdi' }),
      ...Array.from({ length: 20 }, (_, i) =>
        candidate(`filler${i}`, { title: `Futbol turniri ${i}` }),
      ),
    ];
    const scored = scoreCandidates(pool, profile({ keywords: new Map([['qaraba', 1]]) }), NOW);
    expect(scored[0].id).toBe('match');
    expect(scored[0].parts.keywordStem).toBe('qaraba');
  });

  it('uses popularity and freshness when there is no profile', () => {
    const scored = scoreCandidates(
      [candidate('old', { publishedAt: hoursAgo(30) }), candidate('popular', { viewCount: 500 })],
      emptyProfile(),
      NOW,
    );
    expect(scored[0].id).toBe('popular');
  });
});

describe('rerank', () => {
  const pool = Array.from({ length: 40 }, (_, i) =>
    candidate(`a${i}`, { categoryId: i < 25 ? 1 : 2 + (i % 3), sourceId: `s${i % 12}` }),
  );
  const scored = scoreCandidates(pool, profile({ categories: new Map([[1, 1]]) }), NOW);
  const ranked = rerank(scored, 20, 5);

  it('never shows more than two items of one category in a row', () => {
    for (let i = 2; i < ranked.length; i++) {
      const same =
        ranked[i].categoryId === ranked[i - 1].categoryId &&
        ranked[i].categoryId === ranked[i - 2].categoryId;
      expect(same).toBe(false);
    }
  });

  it('keeps sources unique in the first ten items and never repeats one in a row', () => {
    expect(new Set(ranked.slice(0, 10).map((item) => item.sourceId)).size).toBe(10);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].sourceId).not.toBe(ranked[i - 1].sourceId);
    }
  });

  it('places exploration items at the requested rhythm', () => {
    ranked.forEach((item, i) => {
      if (i % 5 === 4) expect(item.exploration).toBe(true);
    });
    expect(ranked.filter((item) => item.exploration).every((item) => item.categoryId !== 1)).toBe(
      true,
    );
  });

  it('rotates exploration across different categories', () => {
    const explored = rerank(scored, 20, 4)
      .filter((item) => item.exploration)
      .map((item) => item.categoryId);
    const available = new Set(
      pool.filter((item) => item.categoryId !== 1).map((item) => item.categoryId),
    );
    expect(new Set(explored.slice(0, available.size)).size).toBe(available.size);
  });

  it('explores more often for new readers', () => {
    const newcomer = rerank(scored, 21, 3).filter((item) => item.exploration).length;
    const regular = rerank(scored, 21, 7).filter((item) => item.exploration).length;
    expect(newcomer).toBeGreaterThan(regular);
  });

  it('does not repeat items', () => {
    expect(new Set(ranked.map((item) => item.id)).size).toBe(ranked.length);
  });
});
