import { describe, expect, it } from 'vitest';
import { extractKeywords, keywordStems } from './keywords.js';

describe('extractKeywords', () => {
  it('drops stopwords and short words', () => {
    const words = extractKeywords('Qarabağ yeni mövsümdə ilk qələbəsini qazandı - VİDEO').map(
      (t) => t.word,
    );
    expect(words).toEqual(['qarabağ', 'mövsümdə', 'qələbəsini', 'qazandı']);
  });

  it('maps inflected forms to the same stem', () => {
    expect(keywordStems('Almaniyanın yeni planı')).toContain('almani');
    expect(keywordStems('Almaniya hökuməti')).toContain('almani');
    expect(keywordStems('Qarabağın qələbəsi')[0]).toBe(keywordStems('Qarabağ çempion oldu')[0]);
  });

  it('skips cyrillic words', () => {
    expect(keywordStems('Новости Азербайджана neft')).toEqual(['neft']);
  });
});
