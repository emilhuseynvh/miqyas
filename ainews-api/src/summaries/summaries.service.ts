import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { summaryConfig } from '../config/configuration.js';
import { TrendingService } from '../stories/trending.service.js';
import { GeminiClient, GeminiRateLimitError } from './gemini.client.js';
import {
  buildPrompt,
  type SourceText,
  type StorySummary,
  SUMMARY_SCHEMA,
  SUMMARY_SYSTEM,
  usableSources,
  validSummary,
} from './summary.prompt.js';

const MAX_ATTEMPTS = 3;
const RATE_LIMIT_PAUSE_MS = 30 * 60 * 1000;
const QUOTA_TIME_ZONE = 'America/Los_Angeles';

@Injectable()
export class SummariesService {
  private readonly logger = new Logger(SummariesService.name);
  private running = false;
  private pausedUntil = 0;

  constructor(
    private readonly dataSource: DataSource,
    private readonly gemini: GeminiClient,
    private readonly trending: TrendingService,
    @Inject(summaryConfig.KEY) private readonly config: ConfigType<typeof summaryConfig>,
  ) {}

  async summarizeNext(batch: number, gapMs: number): Promise<number> {
    if (!this.gemini.enabled || this.running || Date.now() < this.pausedUntil) return 0;
    this.running = true;
    try {
      const remaining = this.config.dailyLimit - (await this.usedToday());
      const storyIds = await this.candidates(Math.min(batch, remaining));
      let done = 0;
      for (const [i, storyId] of storyIds.entries()) {
        if (i > 0) await new Promise((resolve) => setTimeout(resolve, gapMs));
        const result = await this.summarize(storyId);
        if (result === 'rate-limited') break;
        if (result === 'done') done++;
      }
      if (done > 0) this.logger.log(`Summarized ${done} stories`);
      return done;
    } finally {
      this.running = false;
    }
  }

  private async summarize(storyId: string): Promise<'done' | 'skipped' | 'rate-limited'> {
    const sources = usableSources(await this.sourceTexts(storyId));
    if (sources.length < 2) {
      await this.markAttempt(storyId, MAX_ATTEMPTS);
      return 'skipped';
    }
    try {
      const raw = await this.gemini.generateJson<StorySummary>({
        system: SUMMARY_SYSTEM,
        prompt: buildPrompt(sources),
        schema: SUMMARY_SCHEMA,
      });
      const summary = validSummary(raw);
      if (!summary) {
        await this.markAttempt(storyId);
        return 'skipped';
      }
      await this.dataSource.query(
        `UPDATE stories SET summary_title = $2, summary = $3, summary_model = $4, summarized_at = now(),
                summary_attempts = summary_attempts + 1
          WHERE id = $1`,
        [storyId, summary.title, summary.summary, this.gemini.model],
      );
      return 'done';
    } catch (error) {
      if (error instanceof GeminiRateLimitError) {
        this.pausedUntil = Date.now() + RATE_LIMIT_PAUSE_MS;
        this.logger.warn('Gemini rate limit reached, pausing summaries for 30 minutes');
        return 'rate-limited';
      }
      this.logger.warn(`Summary failed for story ${storyId}: ${(error as Error).message}`);
      await this.markAttempt(storyId);
      return 'skipped';
    }
  }

  private async usedToday(): Promise<number> {
    const rows: { count: number }[] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM stories
        WHERE summarized_at >= (date_trunc('day', now() AT TIME ZONE $1) AT TIME ZONE $1)`,
      [QUOTA_TIME_ZONE],
    );
    return rows[0].count;
  }

  private async candidates(limit: number): Promise<string[]> {
    if (limit <= 0) return [];
    const stories = await this.trending.find({ limit, unsummarizedOnly: true, diverse: false });
    return stories.map((story) => story.storyId);
  }

  private sourceTexts(storyId: string): Promise<SourceText[]> {
    return this.dataSource.query(
      `SELECT so.name AS source, a.title, COALESCE(NULLIF(a.content, ''), a.summary, '') AS text
         FROM articles a JOIN sources so ON so.id = a.source_id
        WHERE a.story_id = $1
        ORDER BY (a.content IS NULL), a.published_at ASC`,
      [storyId],
    );
  }

  private async markAttempt(storyId: string, attempts?: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE stories SET summary_attempts = ${attempts === undefined ? 'summary_attempts + 1' : '$2'} WHERE id = $1`,
      attempts === undefined ? [storyId] : [storyId, attempts],
    );
  }
}
