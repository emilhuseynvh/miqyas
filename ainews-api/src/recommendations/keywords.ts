import { AZ_STOPWORDS } from '../common/stopwords.js';

const MIN_LENGTH = 4;
const STEM_LENGTH = 6;
const MAX_KEYWORDS = 8;

const STOPWORDS = new Set(AZ_STOPWORDS.map((word) => word.toLocaleLowerCase('az')));

export type KeywordToken = { stem: string; word: string };

export function stem(word: string): string {
  return word.length > STEM_LENGTH ? word.slice(0, STEM_LENGTH) : word;
}

export function extractKeywords(title: string): KeywordToken[] {
  const seen = new Set<string>();
  const tokens: KeywordToken[] = [];
  for (const raw of title.toLocaleLowerCase('az').split(/[^\p{L}]+/u)) {
    if (raw.length < MIN_LENGTH || STOPWORDS.has(raw) || /^[\p{Script=Cyrillic}]+$/u.test(raw)) {
      continue;
    }
    const key = stem(raw);
    if (seen.has(key)) continue;
    seen.add(key);
    tokens.push({ stem: key, word: raw });
    if (tokens.length === MAX_KEYWORDS) break;
  }
  return tokens;
}

export function keywordStems(title: string): string[] {
  return extractKeywords(title).map((token) => token.stem);
}
