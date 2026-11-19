type Rule = { slug: string; terms: string[] };

const TITLE_RULES: Rule[] = [
  {
    slug: 'suni-intellekt',
    terms: ['süni intellekt', 'suni intellekt', 'chatgpt', 'openai', 'искусственн'],
  },
];

const FEED_RULES: Rule[] = [
  { slug: 'suni-intellekt', terms: ['süni intellekt', 'suni intellekt'] },
  { slug: 'idman', terms: ['idman', 'futbol', 'sport', 'спорт', 'çempionat', 'olimpiya'] },
  {
    slug: 'hadise',
    terms: ['hadisə', 'hadise', 'kriminal', 'hüquq', 'məhkəmə', 'криминал', 'происшеств'],
  },
  { slug: 'texnologiya', terms: ['texnologiya', 'texno', 'ikt', 'hi-tech', 'технолог', 'tech'] },
  {
    slug: 'iqtisadiyyat',
    terms: ['iqtisad', 'maliyyə', 'biznes', 'bank', 'ekonom', 'эконом', 'финанс', 'bazar'],
  },
  { slug: 'enerji', terms: ['enerji', 'energetika', 'neft', 'энерг'] },
  { slug: 'elm', terms: ['elm', 'təhsil', 'tehsil', 'наука', 'образован'] },
  {
    slug: 'medeniyyet',
    terms: ['mədəniyyət', 'medeniyyet', 'şou-biznes', 'şou', 'maqazin', 'incəsənət', 'культур'],
  },
  {
    slug: 'siyaset',
    terms: ['siyasət', 'siyaset', 'milli məclis', 'politika', 'полит', 'rəsmi', 'diplomat'],
  },
  {
    slug: 'dunya',
    terms: ['dünya', 'dunya', 'в мире', 'мир', 'xarici', 'digər ölkələr', 'beynəlxalq'],
  },
  { slug: 'cemiyyet', terms: ['cəmiyyət', 'cemiyyet', 'sosial', 'toplum', 'общество', 'ölkə'] },
  { slug: 'region', terms: ['region', 'bölgə', 'regionlar'] },
];

const normalize = (value: string) => ` ${value.toLocaleLowerCase('az').trim()} `;

const match = (rules: Rule[], text: string) =>
  rules.find((rule) => rule.terms.some((term) => text.includes(term)))?.slug;

export function detectCategorySlug(input: {
  title: string;
  feedCategories: string[];
}): string | undefined {
  const title = normalize(input.title);
  const fromTitle = match(TITLE_RULES, title);
  if (fromTitle) return fromTitle;

  for (const category of input.feedCategories) {
    const found = match(FEED_RULES, normalize(category));
    if (found) return found;
  }
  return undefined;
}
