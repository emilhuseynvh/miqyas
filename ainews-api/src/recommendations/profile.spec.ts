import { describe, expect, it } from 'vitest';
import { buildProfile, exploreEvery, type Signal, SIGNAL_WEIGHTS } from './profile.js';

const NOW = Date.parse('2026-11-18T12:00:00Z');
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000);

const SPORT = 1;
const ECONOMY = 2;
const POLITICS = 3;

const read = (
  categoryId: number,
  at: Date,
  title = 'Xəbər',
  weight = SIGNAL_WEIGHTS.read,
): Signal => ({
  weight,
  at,
  categoryId,
  sourceId: `source-${categoryId}`,
  title,
});

const longTermSport = Array.from({ length: 20 }, (_, i) => read(SPORT, hoursAgo(48 + i * 12)));

describe('buildProfile', () => {
  it('learns the long-term favourite category', () => {
    const profile = buildProfile(longTermSport, [], new Set(), NOW);
    expect(profile.categories.get(SPORT)).toBeCloseTo(1);
  });

  it('lets a fresh burst of reading overtake an old habit', () => {
    const burst = Array.from({ length: 5 }, (_, i) => read(ECONOMY, hoursAgo(i * 0.5)));
    const profile = buildProfile([...longTermSport, ...burst], [], new Set(), NOW);
    expect(profile.shortTermCategories.get(ECONOMY)).toBeCloseTo(1);
    expect(profile.categories.get(ECONOMY)).toBeGreaterThan(
      profile.longTermCategories.get(ECONOMY) ?? 0,
    );
  });

  it('lets the burst fade once it is old', () => {
    const oldBurst = Array.from({ length: 5 }, (_, i) => read(ECONOMY, hoursAgo(72 + i)));
    const profile = buildProfile([...longTermSport, ...oldBurst], [], new Set(), NOW);
    expect(profile.categories.get(SPORT) ?? 0).toBeGreaterThan(
      profile.categories.get(ECONOMY) ?? 0,
    );
  });

  it('learns keywords from headlines', () => {
    const signals = [
      read(SPORT, hoursAgo(1), 'Qarabağ Çempionlar Liqasında qalib gəldi'),
      read(SPORT, hoursAgo(2), 'Qarabağın yeni transferi'),
      read(SPORT, hoursAgo(3), 'Neftçi məğlub oldu'),
    ];
    const profile = buildProfile(signals, [], new Set(), NOW);
    expect(profile.keywords.get('qaraba') ?? 0).toBeGreaterThan(
      profile.keywords.get('neftçi') ?? 0,
    );
    expect(profile.keywordLabels.get('qaraba')).toBe('qarabağ');
  });

  it('lowers categories that were shown but never opened', () => {
    const signals = [...longTermSport, read(POLITICS, hoursAgo(50)), read(POLITICS, hoursAgo(60))];
    const before = buildProfile(signals, [], new Set(), NOW).categories.get(POLITICS) ?? 0;
    const after =
      buildProfile(
        signals,
        [{ categoryId: POLITICS, shownCount: 6, lastShownAt: hoursAgo(1) }],
        new Set(),
        NOW,
      ).categories.get(POLITICS) ?? 0;
    expect(after).toBeLessThan(before);
  });

  it('counts an opened exploration item twice as strongly', () => {
    const plain = buildProfile(
      [...longTermSport, read(ECONOMY, hoursAgo(100))],
      [],
      new Set(),
      NOW,
    );
    const explored = buildProfile(
      [...longTermSport, read(ECONOMY, hoursAgo(100), 'Xəbər', SIGNAL_WEIGHTS.explorationRead)],
      [],
      new Set(),
      NOW,
    );
    expect(explored.categories.get(ECONOMY) ?? 0).toBeGreaterThan(
      plain.categories.get(ECONOMY) ?? 0,
    );
  });

  it('dampens interests while there are few signals', () => {
    const profile = buildProfile([read(SPORT, hoursAgo(1))], [], new Set(), NOW);
    expect(profile.categories.get(SPORT)).toBeLessThan(0.2);
  });

  it('trusts explicitly chosen topics immediately', () => {
    const profile = buildProfile([], [], new Set([ECONOMY]), NOW);
    expect(profile.categories.get(ECONOMY)).toBeCloseTo(1);
  });
});

describe('exploreEvery', () => {
  it('explores about 30% for new readers and 15% for regulars', () => {
    expect(exploreEvery(0)).toBe(3);
    expect(exploreEvery(200)).toBe(7);
  });
});
