import { describe, expect, it } from 'vitest';
import { BREAKING_SOURCES_PER_HOUR, diversify, type TrendingRow } from './trending.js';

const row = (id: string, categoryId: number | null, lastHourSources = 0): TrendingRow => ({
  storyId: id,
  articleId: id,
  categoryId,
  score: 1,
  lastHourSources,
});

describe('diversify', () => {
  it('caps stories per category and keeps order', () => {
    const rows = [row('a', 1), row('b', 1), row('c', 1), row('d', 2)];
    expect(diversify(rows, 10, 2).map((item) => item.storyId)).toEqual(['a', 'b', 'd']);
  });

  it('does not cap uncategorized stories', () => {
    const rows = [row('a', null), row('b', null), row('c', null)];
    expect(diversify(rows, 10, 1)).toHaveLength(3);
  });

  it('stops at the limit', () => {
    expect(diversify([row('a', 1), row('b', 2), row('c', 3)], 2)).toHaveLength(2);
  });

  it('marks fast-growing stories as breaking', () => {
    const [fast, slow] = diversify([row('a', 1, BREAKING_SOURCES_PER_HOUR), row('b', 2, 1)], 10);
    expect(fast.breaking).toBe(true);
    expect(slow.breaking).toBe(false);
  });
});
