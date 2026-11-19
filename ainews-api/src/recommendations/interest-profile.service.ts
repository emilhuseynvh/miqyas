import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  buildProfile,
  type IgnoredImpression,
  type InterestProfile,
  type Signal,
  SIGNAL_WEIGHTS,
} from './profile.js';

const SIGNAL_WINDOW_DAYS = 60;
const MAX_SIGNALS = 3000;

type SignalRow = {
  weight: number;
  at: Date;
  category_id: number | null;
  source_id: string;
  title: string;
};

type ImpressionRow = {
  category_id: number | null;
  shown_count: number;
  last_shown_at: Date;
};

@Injectable()
export class InterestProfileService {
  constructor(private readonly dataSource: DataSource) {}

  async build(userId: string): Promise<InterestProfile> {
    const [signals, ignored, explicit] = await Promise.all([
      this.signals(userId),
      this.ignoredImpressions(userId),
      this.explicitInterests(userId),
    ]);
    return buildProfile(signals, ignored, explicit, Date.now());
  }

  private async signals(userId: string): Promise<Signal[]> {
    const rows: SignalRow[] = await this.dataSource.query(
      `
      SELECT s.weight, s.at, a.category_id, a.source_id, a.title
        FROM (
          SELECT article_id, CASE WHEN from_exploration THEN $2::float ELSE $3::float END AS weight, read_at AS at
            FROM reading_history WHERE user_id = $1
          UNION ALL
          SELECT article_id, CASE WHEN value = 1 THEN $4::float ELSE $5::float END, updated_at
            FROM article_reactions WHERE user_id = $1
          UNION ALL
          SELECT article_id, $6::float, created_at FROM saved_articles WHERE user_id = $1
          UNION ALL
          SELECT article_id, $7::float, created_at FROM hidden_articles WHERE user_id = $1
        ) s
        JOIN articles a ON a.id = s.article_id
       WHERE s.at > now() - make_interval(days => $8)
       ORDER BY s.at DESC
       LIMIT $9
      `,
      [
        userId,
        SIGNAL_WEIGHTS.explorationRead,
        SIGNAL_WEIGHTS.read,
        SIGNAL_WEIGHTS.like,
        SIGNAL_WEIGHTS.dislike,
        SIGNAL_WEIGHTS.save,
        SIGNAL_WEIGHTS.hide,
        SIGNAL_WINDOW_DAYS,
        MAX_SIGNALS,
      ],
    );
    return rows.map((row) => ({
      weight: Number(row.weight),
      at: new Date(row.at),
      categoryId: row.category_id === null ? null : Number(row.category_id),
      sourceId: row.source_id,
      title: row.title,
    }));
  }

  private async ignoredImpressions(userId: string): Promise<IgnoredImpression[]> {
    const rows: ImpressionRow[] = await this.dataSource.query(
      `
      SELECT a.category_id, i.shown_count, i.last_shown_at
        FROM feed_impressions i
        JOIN articles a ON a.id = i.article_id
       WHERE i.user_id = $1
         AND i.last_shown_at > now() - make_interval(days => $2)
         AND NOT EXISTS (SELECT 1 FROM reading_history h WHERE h.user_id = $1 AND h.article_id = i.article_id)
         AND NOT EXISTS (SELECT 1 FROM article_reactions r WHERE r.user_id = $1 AND r.article_id = i.article_id)
         AND NOT EXISTS (SELECT 1 FROM saved_articles v WHERE v.user_id = $1 AND v.article_id = i.article_id)
         AND NOT EXISTS (SELECT 1 FROM hidden_articles x WHERE x.user_id = $1 AND x.article_id = i.article_id)
      `,
      [userId, SIGNAL_WINDOW_DAYS],
    );
    return rows.map((row) => ({
      categoryId: row.category_id === null ? null : Number(row.category_id),
      shownCount: row.shown_count,
      lastShownAt: new Date(row.last_shown_at),
    }));
  }

  private async explicitInterests(userId: string): Promise<Set<number>> {
    const rows: { category_id: number }[] = await this.dataSource.query(
      `SELECT category_id FROM user_interests WHERE user_id = $1`,
      [userId],
    );
    return new Set(rows.map((row) => Number(row.category_id)));
  }
}
