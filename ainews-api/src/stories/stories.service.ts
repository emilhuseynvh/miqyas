import { Injectable, Logger } from '@nestjs/common';
import { DataSource, type EntityManager } from 'typeorm';

export const SIMILARITY_THRESHOLD = 0.5;
const MAX_GAP_HOURS = 24;
const MIN_KEY_LENGTH = 12;
const BATCH_SIZE = 1500;

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
