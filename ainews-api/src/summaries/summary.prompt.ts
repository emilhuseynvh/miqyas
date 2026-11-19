export type SourceText = { source: string; title: string; text: string };
export type StorySummary = { title: string; summary: string };

export const MAX_SOURCES = 5;
const MAX_TEXT_CHARS = 1500;
const MIN_TEXT_CHARS = 150;
const AZ_LETTERS = /[əğıöüşç]/i;

export const SUMMARY_SYSTEM = [
  'Sən Azərbaycan dilində işləyən neytral xəbər redaktorusan.',
  'Yalnız verilən mətnlərdəki faktlardan istifadə et. Heç nə uydurma, şərh, qiymətləndirmə və ya proqnoz yazma.',
  'Mənbələr bir-birinə zidd məlumat verirsə, bunu açıq qeyd et.',
  'title: 60-95 simvol, aydın və neytral başlıq. Mənbələrin başlıqlarını hərfi təkrarlama, sensasiya və nida işarəsi olmasın.',
  'summary: 3-5 cümlə, 60-110 söz. Nə baş verib, kim, harada, nə vaxt və hadisənin konteksti. Mətnlərdən cümlə köçürmə, öz sözlərinlə yaz. Son cümlə qiymətləndirmə olmasın.',
  'Dil: Azərbaycan dili, latın əlifbası.',
].join('\n');

export const SUMMARY_SCHEMA = {
  type: 'OBJECT',
  properties: { title: { type: 'STRING' }, summary: { type: 'STRING' } },
  required: ['title', 'summary'],
};

export function usableSources(items: SourceText[]): SourceText[] {
  const seen = new Set<string>();
  return items
    .map((item) => ({ ...item, text: item.text.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_CHARS) }))
    .filter((item) => {
      if (item.text.length < MIN_TEXT_CHARS || seen.has(item.source)) return false;
      seen.add(item.source);
      return true;
    })
    .slice(0, MAX_SOURCES);
}

export function buildPrompt(items: SourceText[]): string {
  const blocks = items.map(
    (item, i) => `${i + 1}. Mənbə: ${item.source}\nBaşlıq: ${item.title}\nMətn: ${item.text}`,
  );
  return `Aşağıda eyni hadisə haqqında Azərbaycan xəbər saytlarının yazıları var.\n\n${blocks.join('\n\n')}`;
}

export function validSummary(value: unknown): StorySummary | null {
  if (!value || typeof value !== 'object') return null;
  const { title, summary } = value as Record<string, unknown>;
  if (typeof title !== 'string' || typeof summary !== 'string') return null;
  const cleanTitle = title.replace(/\s+/g, ' ').trim().replace(/[.!]+$/, '');
  const cleanSummary = summary.replace(/\s+/g, ' ').trim();
  if (cleanTitle.length < 20 || cleanTitle.length > 150) return null;
  if (cleanSummary.length < 150 || cleanSummary.length > 1500) return null;
  if (!AZ_LETTERS.test(cleanTitle + cleanSummary)) return null;
  return { title: cleanTitle, summary: cleanSummary };
}
