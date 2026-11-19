import { slugify } from '../common/slug.js';

export function uniqueSourceSlug(name: string, taken: Set<string>): string {
  const base = slugify(name) || 'menbe';
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  taken.add(slug);
  return slug;
}
