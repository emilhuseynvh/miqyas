import { AZ_STOPWORDS } from './stopwords.js';

const IGNORED = new Set(
  [
    ...AZ_STOPWORDS,
    'video',
    'foto',
    'fotolar',
    'yenilənib',
    'eksklüziv',
    'rəsmi',
    'canlı',
    'təcili',
    'şok',
  ].map((word) => word.toLocaleLowerCase('az')),
);

export function titleKey(title: string): string {
  return title
    .toLocaleLowerCase('az')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 1 && !IGNORED.has(word))
    .join(' ')
    .trim();
}
