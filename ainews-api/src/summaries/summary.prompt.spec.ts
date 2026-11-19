import { describe, expect, it } from 'vitest';
import { buildPrompt, MAX_SOURCES, usableSources, validSummary } from './summary.prompt.js';

const text = 'Prezident sərəncam imzalayıb və bununla bağlı ətraflı məlumat verilib. '.repeat(4);

describe('usableSources', () => {
  it('drops short texts and duplicate sources', () => {
    const result = usableSources([
      { source: 'APA', title: 'a', text },
      { source: 'APA', title: 'b', text },
      { source: 'Report', title: 'c', text: 'qısa' },
      { source: 'Oxu', title: 'd', text },
    ]);
    expect(result.map((item) => item.source)).toEqual(['APA', 'Oxu']);
  });

  it('limits the number of sources', () => {
    const items = Array.from({ length: 8 }, (_, i) => ({ source: `S${i}`, title: 't', text }));
    expect(usableSources(items)).toHaveLength(MAX_SOURCES);
  });
});

describe('buildPrompt', () => {
  it('numbers each source', () => {
    const prompt = buildPrompt([{ source: 'APA', title: 'Başlıq', text: 'Mətn' }]);
    expect(prompt).toContain('1. Mənbə: APA');
  });
});

describe('validSummary', () => {
  const summary =
    'Prezident İlham Əliyev sərəncam imzalayıb. Sərəncama əsasən universitetin rəhbərliyi dəyişib. Yeni rektor təyin olunub və o, əvvəlki vəzifəsindən azad edilib.';

  it('accepts a well-formed summary and trims the title', () => {
    expect(validSummary({ title: 'BDU-ya yeni rektor təyin olunub, əvvəlki rektor azad edilib.', summary })).toEqual({
      title: 'BDU-ya yeni rektor təyin olunub, əvvəlki rektor azad edilib',
      summary,
    });
  });

  it('rejects short or non-Azerbaijani output', () => {
    expect(validSummary({ title: 'Qısa', summary })).toBeNull();
    expect(validSummary({ title: 'A new rector was appointed to the university today', summary: 'x'.repeat(200) })).toBeNull();
    expect(validSummary(null)).toBeNull();
  });
});
