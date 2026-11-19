export const STRONG_SIMILARITY = 0.75;
export const CANDIDATE_SIMILARITY = 0.6;

const PREFIX = 5;
const COMMON_NAMES = new Set(['prezi', 'azərb', 'bakı', 'bakıd', 'bakın', 'respu', 'dövlə', 'milli', 'nazir']);
const SPLIT = /[\s,.:;!?"'“”«»()[\]–—-]+/u;
const UPPER = /^\p{Lu}/u;

export function namesIn(title: string): Set<string> {
  const names = title
    .split(SPLIT)
    .slice(1)
    .filter((word) => UPPER.test(word))
    .map((word) => word.toLocaleLowerCase('az').slice(0, PREFIX))
    .filter((name) => !COMMON_NAMES.has(name));
  return new Set(names);
}

const isSubset = (a: Set<string>, b: Set<string>) => [...a].every((item) => b.has(item));

export function isSameEvent(a: string, b: string, similarity: number): boolean {
  if (similarity >= STRONG_SIMILARITY) return true;
  if (similarity < CANDIDATE_SIMILARITY) return false;
  const left = namesIn(a);
  const right = namesIn(b);
  if (left.size === 0 && right.size === 0) return false;
  return isSubset(left, right) || isSubset(right, left);
}
