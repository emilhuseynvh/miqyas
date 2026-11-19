import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  diversify,
  TRENDING_MIN_SOURCES,
  TRENDING_SCORE_SQL,
  TRENDING_WINDOW_HOURS,
  type TrendingRow,
  type TrendingStory,
} from './trending.js';

const LANGUAGE = 'az';
const AZ_LETTERS = '[əƏğĞıİöÖüÜşŞçÇ]';
const POOL_SIZE = 300;

export type TrendingOptions = {
  limit: number;
  categoryId?: number;
  unsummarizedOnly?: boolean;
  summarizedOnly?: boolean;
  maxAgeHours?: number;
  diverse?: boolean;
};

@Injectable()
export class TrendingService {
  constructor(private readonly dataSource: DataSource) {}

  async find(options: TrendingOptions): Promise<TrendingStory[]> {
    const params: unknown[] = [TRENDING_MIN_SOURCES, TRENDING_WINDOW_HOURS, LANGUAGE, AZ_LETTERS, POOL_SIZE];
    const filters: string[] = [];
    if (options.categoryId !== undefined) {
      params.push(options.categoryId);
      filters.push(`AND p.category_id = $${params.length}`);
    }
    if (options.unsummarizedOnly) filters.push('AND s.summary IS NULL AND s.summary_attempts < 3');
    if (options.summarizedOnly) filters.push('AND s.summary IS NOT NULL');
    if (options.maxAgeHours !== undefined) {
      params.push(options.maxAgeHours);
      filters.push(`AND s.first_published_at > now() - make_interval(hours => $${params.length})`);
    }

    const rows: TrendingRow[] = await this.dataSource.query(
      `WITH recent AS (
         SELECT a.story_id,
                COUNT(DISTINCT a.source_id) FILTER (WHERE a.published_at > now() - interval '1 hour')::int AS last_hour,
                COALESCE(SUM(a.view_count), 0)::int AS views
           FROM articles a
          WHERE a.story_id IS NOT NULL
            AND a.published_at > now() - make_interval(hours => $2 + 12)
          GROUP BY a.story_id
       )
       SELECT s.id AS "storyId", p.id AS "articleId", p.category_id AS "categoryId",
              r.last_hour AS "lastHourSources", ${TRENDING_SCORE_SQL} AS score
         FROM stories s
         JOIN recent r ON r.story_id = s.id
         JOIN articles p ON p.id = s.primary_article_id
         JOIN sources so ON so.id = p.source_id
        WHERE s.source_count >= $1
          AND s.last_published_at > now() - make_interval(hours => $2)
          AND so.language = $3 AND so.is_active
          AND NOT p.is_junk
          AND p.title ~ $4
          ${filters.join(' ')}
        ORDER BY score DESC
        LIMIT $5`,
      params,
    );
    const normalized = rows.map((row) => ({
      ...row,
      categoryId: row.categoryId === null ? null : Number(row.categoryId),
      score: Number(row.score),
    }));
    return diversify(normalized, options.limit, options.diverse === false ? Number.POSITIVE_INFINITY : undefined);
  }
}
