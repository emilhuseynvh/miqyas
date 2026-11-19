const PATTERNS = [
  /bürc/,
  /ulduz falı|[gh]oroskop|astroloq/,
  /valyuta məzənnələri|bugünkü məzənnəsi|rəsmi məzənnələr/,
  /namaz vaxt|iftar vaxt|imsak vaxt|azan vaxt/,
  /promokod|endirimlər sizi gözləyir/,
  /^(günün|həftənin) (əsas |önəmli )?xəbərləri|xəbərlər lenti|günün icmalı/,
];

const PROMO = /endirim/;
const PERCENT = /\d\s*%/;

export function isJunkTitle(title: string): boolean {
  const text = title.toLocaleLowerCase('az').replace(/\s+/g, ' ').trim();
  if (PATTERNS.some((pattern) => pattern.test(text))) return true;
  return PROMO.test(text) && PERCENT.test(text);
}
