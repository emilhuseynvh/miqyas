export const TRENDING_MIN_SOURCES = 3;
export const TRENDING_WINDOW_HOURS = 36;
export const BREAKING_SOURCES_PER_HOUR = 10;
export const MAX_PER_CATEGORY = 5;

export type TrendingRow = {
  storyId: string;
  articleId: string;
  categoryId: number | null;
  score: number;
  lastHourSources: number;
};

export type TrendingStory = TrendingRow & { breaking: boolean };

export const TRENDING_SCORE_SQL = `(
  ln(1 + s.source_count) * power(2, -EXTRACT(EPOCH FROM (now() - s.first_published_at)) / 3600 / 6)
  + 0.6 * ln(1 + r.last_hour)
  + 0.3 * ln(1 + r.views)
) * CASE WHEN p.title ~* '(təbrik|başsağlığı)' THEN 0.5 ELSE 1 END`;

export function diversify(rows: TrendingRow[], limit: number, perCategory = MAX_PER_CATEGORY): TrendingStory[] {
  const counts = new Map<number | null, number>();
  const picked: TrendingStory[] = [];
  for (const row of rows) {
    const used = counts.get(row.categoryId) ?? 0;
    if (row.categoryId !== null && used >= perCategory) continue;
    counts.set(row.categoryId, used + 1);
    picked.push({ ...row, breaking: row.lastHourSources >= BREAKING_SOURCES_PER_HOUR });
    if (picked.length === limit) break;
  }
  return picked;
}
