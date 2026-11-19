import { Injectable, Logger } from '@nestjs/common';
import { DataSource, type EntityManager } from 'typeorm';
import { CANDIDATE_SIMILARITY, isSameEvent } from './same-event.js';

export const SIMILARITY_THRESHOLD = 0.5;
const MAX_GAP_HOURS = 24;
const MIN_KEY_LENGTH = 12;
const BATCH_SIZE = 1500;
const MERGE_WINDOW_HOURS = 36;

type SummaryPair = {
  older: string;
  newer: string;
  older_title: string;
  newer_title: string;
  sim: number;
};

type Pending = {
  id: string;
  title_key: string | null;
  published_at: Date;
};

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);
  private running = false;

  constructor(private readonly dataSource: DataSource) {}

  async clusterPending(): Promise<number> {
    if (this.running) return 0;
    this.running = true;
    try {
      let grouped = 0;
      await this.dataSource.transaction(async (manager) => {
        await manager.query(`SET LOCAL pg_trgm.similarity_threshold = ${SIMILARITY_THRESHOLD}`);
        const pending: Pending[] = await manager.query(
          `SELECT id, title_key, published_at FROM articles
            WHERE clustered_at IS NULL
            ORDER BY published_at ASC
            LIMIT $1`,
          [BATCH_SIZE],
        );
        for (const article of pending) {
          if (await this.assign(manager, article)) grouped++;
        }
        if (pending.length > 0) {
          this.logger.log(
            `Clustered ${pending.length} articles, ${grouped} joined existing stories`,
          );
        }
      });
      return grouped;
    } finally {
      this.running = false;
    }
  }

  async mergeDuplicateSummaries(): Promise<number> {
    const pairs: SummaryPair[] = await this.dataSource.query(
      `SELECT a.id AS older, b.id AS newer, a.summary_title AS older_title, b.summary_title AS newer_title,
              similarity(a.summary_title, b.summary_title) AS sim
         FROM stories a
         JOIN stories b ON a.id <> b.id
          AND (a.first_published_at, a.id) < (b.first_published_at, b.id)
        WHERE a.summary IS NOT NULL AND b.summary IS NOT NULL
          AND a.first_published_at > now() - make_interval(hours => $1)
          AND b.first_published_at > now() - make_interval(hours => $1)
          AND similarity(a.summary_title, b.summary_title) >= $2
        ORDER BY a.first_published_at ASC`,
      [MERGE_WINDOW_HOURS, CANDIDATE_SIMILARITY],
    );
    const absorbed = new Map<string, string>();
    const root = (id: string): string => {
      let current = id;
      while (absorbed.has(current)) current = absorbed.get(current) as string;
      return current;
    };
    for (const pair of pairs) {
      if (!isSameEvent(pair.older_title, pair.newer_title, Number(pair.sim))) continue;
      const target = root(pair.older);
      const source = root(pair.newer);
      if (target === source) continue;
      absorbed.set(source, target);
    }
    for (const [source] of absorbed) await this.merge(root(source), source);
    if (absorbed.size > 0) this.logger.log(`Merged ${absorbed.size} duplicate stories`);
    return absorbed.size;
  }

  private async merge(targetId: string, sourceId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`UPDATE articles SET story_id = $1 WHERE story_id = $2`, [targetId, sourceId]);
      await manager.query(
        `INSERT INTO telegram_posts (kind, ref, message_id, posted_at)
         SELECT kind, $1, message_id, posted_at FROM telegram_posts WHERE kind = 'story' AND ref = $2
         ON CONFLICT DO NOTHING`,
        [targetId, sourceId],
      );
      await manager.query(`DELETE FROM stories WHERE id = $1`, [sourceId]);
      await this.refresh(manager, targetId);
    });
  }

  private async assign(manager: EntityManager, article: Pending): Promise<boolean> {
    const key = article.title_key ?? '';
    const match: { story_id: string }[] =
      key.length >= MIN_KEY_LENGTH
        ? await manager.query(
            `SELECT a.story_id
               FROM articles a
              WHERE a.story_id IS NOT NULL
                AND a.id <> $2
                AND a.title_key % $1
                AND abs(EXTRACT(EPOCH FROM (a.published_at - $3))) < $4
              ORDER BY similarity(a.title_key, $1) DESC
              LIMIT 1`,
            [key, article.id, article.published_at, MAX_GAP_HOURS * 3600],
          )
        : [];

    if (match.length > 0) {
      const storyId = match[0].story_id;
      await manager.query(`UPDATE articles SET story_id = $1, clustered_at = now() WHERE id = $2`, [
        storyId,
        article.id,
      ]);
      await this.refresh(manager, storyId);
      return true;
    }

    const created: { id: string }[] = await manager.query(
      `INSERT INTO stories (primary_article_id, first_published_at, last_published_at)
       VALUES ($1, $2, $2) RETURNING id`,
      [article.id, article.published_at],
    );
    await manager.query(`UPDATE articles SET story_id = $1, clustered_at = now() WHERE id = $2`, [
      created[0].id,
      article.id,
    ]);
    return false;
  }

  private async refresh(manager: EntityManager, storyId: string): Promise<void> {
    await manager.query(
      `UPDATE stories s SET
         article_count = agg.articles,
         source_count = agg.sources,
         first_published_at = agg.first,
         last_published_at = agg.last,
         primary_article_id = agg.primary_id,
         updated_at = now()
       FROM (
         SELECT COUNT(*)::int AS articles,
                COUNT(DISTINCT source_id)::int AS sources,
                MIN(published_at) AS first,
                MAX(published_at) AS last,
                (array_agg(id ORDER BY (image_url IS NULL), published_at ASC))[1] AS primary_id
           FROM articles WHERE story_id = $1
       ) agg
       WHERE s.id = $1`,
      [storyId],
    );
  }
}
