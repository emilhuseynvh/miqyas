import { describe, expect, it } from 'vitest';
import { isSameEvent, namesIn } from './same-event.js';

describe('namesIn', () => {
  it('collects capitalized names except the first word and common ones', () => {
    expect([...namesIn('Azərbaycan Prezidenti Vyetnam Xəbər Agentliyinə müsahibə verib')]).toEqual([
      'vyetn',
      'xəbər',
      'agent',
    ]);
  });
});

describe('isSameEvent', () => {
  it('merges near-identical titles', () => {
    expect(
      isSameEvent(
        'Prezident İlham Əliyev Vyetnam Xəbər Agentliyinə müsahibə verib',
        'Prezident İlham Əliyev Vyetnam Xəbər Agentliyinə müsahibə təqdim edib',
        0.79,
      ),
    ).toBe(true);
  });

  it('merges paraphrases that mention the same names', () => {
    expect(
      isSameEvent(
        'Azərbaycan Prezidenti Vyetnam Xəbər Agentliyinə müsahibə verib',
        'Prezident İlham Əliyev Vyetnam Xəbər Agentliyinə müsahibə verib',
        0.67,
      ),
    ).toBe(true);
  });

  it('keeps similar titles about different countries apart', () => {
    expect(
      isSameEvent(
        'Azərbaycan və Gürcüstan arasında ticarət dövriyyəsinin həcmi artıb',
        'Azərbaycan ilə Vyetnam arasında ticarət dövriyyəsinin həcmi artıb',
        0.72,
      ),
    ).toBe(false);
  });

  it('does not merge generic titles without names', () => {
    expect(isSameEvent('Yol qəzasında iki nəfər ölüb', 'Yol qəzasında iki nəfər yaralanıb', 0.7)).toBe(false);
  });

  it('ignores low similarity', () => {
    expect(isSameEvent('Vyetnam müsahibəsi', 'Vyetnam müsahibəsi', 0.4)).toBe(false);
  });
});
