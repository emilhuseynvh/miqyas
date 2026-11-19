import { createHash } from 'node:crypto';

const MAX_BASE_LENGTH = 80;

const map: Record<string, string> = {
  ə: 'e',
  ı: 'i',
  ö: 'o',
  ü: 'u',
  ş: 's',
  ç: 'c',
  ğ: 'g',
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

export function slugify(text: string): string {
  const transliterated = [...text.toLocaleLowerCase('az')]
    .map((char) => map[char] ?? char)
    .join('')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '');

  const base = transliterated.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  if (base.length <= MAX_BASE_LENGTH) return base;
  const cut = base.slice(0, MAX_BASE_LENGTH);
  const lastDash = cut.lastIndexOf('-');
  return lastDash > MAX_BASE_LENGTH / 2 ? cut.slice(0, lastDash) : cut;
}

export function articleSlug(title: string, url: string): string {
  const suffix = createHash('sha1').update(url).digest('hex').slice(0, 6);
  const base = slugify(title);
  return base ? `${base}-${suffix}` : suffix;
}
