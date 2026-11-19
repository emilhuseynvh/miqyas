import { Inject, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { appConfig, ingestionConfig, telegramConfig } from '../config/configuration.js';
import { TrendingService } from '../stories/trending.service.js';
import { TelegramClient, TelegramError } from './telegram.client.js';
import { digestMessage, storyMessage } from './telegram.format.js';

const TIME_ZONE = 'Asia/Baku';
const QUIET_UNTIL_HOUR = 7;
const MIN_GAP_MINUTES = 20;
const STORY_MAX_AGE_HOURS = 12;
const DIGEST_SIZE = 7;
const DIGEST_FIRST_HOUR = 8;

type StoryRow = {
  storyId: string;
  title: string;
  summary: string;
  slug: string;
  sourceCount: number;
  category: string | null;
};

@Injectable()
export class TelegramService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TelegramService.name);
  private running = false;
  private pausedUntil = 0;

  constructor(
    private readonly dataSource: DataSource,
    private readonly client: TelegramClient,
    private readonly trending: TrendingService,
    @Inject(appConfig.KEY) private readonly app: ConfigType<typeof appConfig>,
    @Inject(telegramConfig.KEY) private readonly config: ConfigType<typeof telegramConfig>,
    @Inject(ingestionConfig.KEY) private readonly ingestion: ConfigType<typeof ingestionConfig>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.client.enabled || !this.ingestion.enabled) return;
    try {
      this.logger.log(`Telegram channel connected: ${await this.client.channelTitle()}`);
    } catch (error) {
      this.logger.error(`Telegram channel is not reachable: ${(error as Error).message}`);
    }
  }

  async postNextStory(): Promise<void> {
    await this.exclusive(async () => {
      if ((await this.postedToday('story')) >= this.config.dailyLimit) return;

      const candidates = await this.trending.find({
        limit: 10,
        summarizedOnly: true,
        maxAgeHours: STORY_MAX_AGE_HOURS,
        diverse: false,
      });
      const posted = await this.alreadyPosted(candidates.map((story) => story.storyId));
      const next = candidates.find((story) => !posted.has(story.storyId));
      if (!next) return;

      const quiet = bakuNow().hour < QUIET_UNTIL_HOUR;
      if (!next.breaking && (quiet || (await this.minutesSinceLastPost()) < MIN_GAP_MINUTES)) return;

      const story = await this.storyDetails(next.storyId);
      if (!story) return;
      const url = this.articleUrl(story.slug);
      await this.publish('story', story.storyId, () =>
        this.client.sendMessage(
          storyMessage({
            title: story.title,
            summary: story.summary,
            url,
            sourceCount: story.sourceCount,
            category: story.category,
            breaking: next.breaking,
          }),
          url,
        ),
      );
    });
  }

  async postMorningDigest(): Promise<void> {
    await this.exclusive(async () => {
      const now = bakuNow();
      if (now.hour < DIGEST_FIRST_HOUR) return;
      const stories = await this.trending.find({ limit: DIGEST_SIZE, summarizedOnly: true, maxAgeHours: 24 });
      if (stories.length < 3) return;

      const details = (await Promise.all(stories.map((story) => this.storyDetails(story.storyId)))).filter(
        (story): story is StoryRow => story !== null,
      );
      await this.publish('digest', now.date, () =>
        this.client.sendMessage(
          digestMessage(
            now.label,
            details.map((story) => ({
              title: story.title,
              url: this.articleUrl(story.slug),
              sourceCount: story.sourceCount,
            })),
            this.app.url,
          ),
        ),
      );
    });
  }

  private async exclusive(task: () => Promise<void>): Promise<void> {
    if (!this.client.enabled || this.running || Date.now() < this.pausedUntil) return;
    this.running = true;
    try {
      await task();
    } finally {
      this.running = false;
    }
  }

  private async publish(kind: string, ref: string, send: () => Promise<number>): Promise<void> {
    const claimed: { id: string }[] = await this.dataSource.query(
      `INSERT INTO telegram_posts (kind, ref) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id`,
      [kind, ref],
    );
    if (claimed.length === 0) return;
    try {
      const messageId = await send();
      await this.dataSource.query(`UPDATE telegram_posts SET message_id = $2 WHERE id = $1`, [claimed[0].id, messageId]);
      this.logger.log(`Posted ${kind} ${ref} to Telegram`);
    } catch (error) {
      const permanent = error instanceof TelegramError && error.status === 400;
      if (!permanent) await this.dataSource.query(`DELETE FROM telegram_posts WHERE id = $1`, [claimed[0].id]);
      if (error instanceof TelegramError && error.retryAfter) {
        this.pausedUntil = Date.now() + error.retryAfter * 1000;
      }
      this.logger.warn(`Telegram ${kind} ${ref} failed: ${(error as Error).message}`);
    }
  }

  private async postedToday(kind: string): Promise<number> {
    const rows: { count: number }[] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM telegram_posts
        WHERE kind = $1 AND posted_at >= (date_trunc('day', now() AT TIME ZONE $2) AT TIME ZONE $2)`,
      [kind, TIME_ZONE],
    );
    return rows[0].count;
  }

  private async minutesSinceLastPost(): Promise<number> {
    const rows: { minutes: number | null }[] = await this.dataSource.query(
      `SELECT EXTRACT(EPOCH FROM (now() - MAX(posted_at))) / 60 AS minutes FROM telegram_posts WHERE kind = 'story'`,
    );
    return rows[0].minutes === null ? Number.POSITIVE_INFINITY : Number(rows[0].minutes);
  }

  private async alreadyPosted(storyIds: string[]): Promise<Set<string>> {
    if (storyIds.length === 0) return new Set();
    const rows: { ref: string }[] = await this.dataSource.query(
      `SELECT ref FROM telegram_posts WHERE kind = 'story' AND ref = ANY($1::text[])`,
      [storyIds],
    );
    return new Set(rows.map((row) => row.ref));
  }

  private async storyDetails(storyId: string): Promise<StoryRow | null> {
    const rows: StoryRow[] = await this.dataSource.query(
      `SELECT s.id AS "storyId", s.summary_title AS title, s.summary, a.slug,
              s.source_count AS "sourceCount", c.name AS category
         FROM stories s
         JOIN articles a ON a.id = s.primary_article_id
         LEFT JOIN categories c ON c.id = a.category_id
        WHERE s.id = $1 AND s.summary IS NOT NULL`,
      [storyId],
    );
    return rows[0] ?? null;
  }

  private articleUrl(slug: string): string {
    return new URL(`/xeber/${slug}`, this.app.url).toString();
  }
}

function bakuNow(): { hour: number; date: string; label: string } {
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE }).format(now));
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now);
  const label = new Intl.DateTimeFormat('az-AZ', { day: 'numeric', month: 'long', timeZone: TIME_ZONE }).format(now);
  return { hour, date, label };
}
