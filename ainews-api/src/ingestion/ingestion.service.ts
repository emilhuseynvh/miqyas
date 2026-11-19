import { Injectable, Logger } from '@nestjs/common';
import { ArticlesService, type NewArticle } from '../articles/articles.service.js';
import { CategoriesService } from '../categories/categories.service.js';
import { detectCategorySlug } from '../categories/category-detector.js';
import { mapWithConcurrency } from '../common/concurrency.js';
import { articleSlug } from '../common/slug.js';
import { titleKey } from '../common/title-key.js';
import { ArticleExtractorService } from '../content/article-extractor.service.js';
import type { Source } from '../sources/entities/source.entity.js';
import { SourcesService } from '../sources/sources.service.js';
import { StoriesService } from '../stories/stories.service.js';
import { type FeedEntry, FeedReaderService } from './feed-reader.service.js';

const CONCURRENCY = 8;
const ENRICH_CONCURRENCY = 4;
const ENRICH_LIMIT_PER_SOURCE = 30;
const ENRICH_WINDOW_MS = 48 * 60 * 60 * 1000;

type Candidate = FeedEntry & Partial<Pick<NewArticle, 'content' | 'contentExtractedAt'>>;
type CompleteCandidate = Candidate & { summary: string; imageUrl: string };

const isComplete = (entry: Candidate): entry is CompleteCandidate =>
  Boolean(entry.title.trim() && entry.summary?.trim() && entry.imageUrl);

const isRecent = (entry: FeedEntry) =>
  !entry.publishedAt || entry.publishedAt.getTime() > Date.now() - ENRICH_WINDOW_MS;

export type SourceFetchResult = {
  sourceId: string;
  ok: boolean;
  found: number;
  skipped: number;
  inserted: number;
  error?: string;
};

export type IngestionRun = {
  startedAt: Date;
  finishedAt: Date;
  sources: number;
  succeeded: number;
  failed: number;
  inserted: number;
};

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private running: Promise<IngestionRun> | null = null;
  private lastRun: IngestionRun | null = null;

  constructor(
    private readonly sources: SourcesService,
    private readonly articles: ArticlesService,
    private readonly reader: FeedReaderService,
    private readonly extractor: ArticleExtractorService,
    private readonly categories: CategoriesService,
    private readonly stories: StoriesService,
  ) {}

  get status() {
    return { running: this.running !== null, lastRun: this.lastRun };
  }

  runAll(): Promise<IngestionRun> {
    this.running ??= this.execute().finally(() => {
      this.running = null;
    });
    return this.running;
  }

  async fetchSource(source: Source): Promise<SourceFetchResult> {
    const result = { sourceId: source.id, found: 0, skipped: 0, inserted: 0 };
    if (!source.feedUrl) return { ...result, ok: false, error: 'No feed URL' };

    try {
      const entries = await this.reader.read(source.feedUrl);
      const existing = await this.articles.findExistingUrls(entries.map((entry) => entry.url));
      const fresh = entries.filter((entry) => !existing.has(entry.url));

      const ready = fresh.filter(isComplete);
      const incomplete = fresh
        .filter((entry) => !isComplete(entry) && isRecent(entry))
        .slice(0, ENRICH_LIMIT_PER_SOURCE);
      const enriched = (
        await mapWithConcurrency(incomplete, ENRICH_CONCURRENCY, (entry) => this.enrich(entry))
      ).filter(isComplete);

      const inserted = await this.articles.insertNew(
        await this.toArticles(source, [...ready, ...enriched]),
      );
      await this.sources.recordSuccess(source, entries.length);
      return {
        ...result,
        ok: true,
        found: entries.length,
        skipped: fresh.length - ready.length - enriched.length,
        inserted,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.sources.recordFailure(source, message);
      return { ...result, ok: false, error: message };
    }
  }

  private async enrich(entry: FeedEntry): Promise<Candidate> {
    const page = await this.extractor.read(entry.url, entry.title).catch(() => null);
    if (!page) return entry;
    return {
      ...entry,
      imageUrl: entry.imageUrl ?? page.imageUrl,
      summary: entry.summary ?? page.description,
      content: page.content,
      contentExtractedAt: new Date(),
    };
  }

  private async toArticles(source: Source, entries: CompleteCandidate[]): Promise<NewArticle[]> {
    const categoryIds = await this.categories.idsBySlug();
    return entries.map((entry) => ({
      sourceId: source.id,
      categoryId:
        source.defaultCategoryId ??
        categoryIds.get(
          detectCategorySlug({ title: entry.title, feedCategories: entry.categories }) ?? '',
        ) ??
        null,
      title: entry.title,
      slug: articleSlug(entry.title, entry.url),
      titleKey: titleKey(entry.title),
      url: entry.url,
      summary: entry.summary,
      imageUrl: entry.imageUrl,
      author: entry.author,
      feedCategories: entry.categories,
      publishedAt: entry.publishedAt ?? new Date(),
      ...(entry.contentExtractedAt
        ? { content: entry.content ?? null, contentExtractedAt: entry.contentExtractedAt }
        : {}),
    }));
  }

  private async execute(): Promise<IngestionRun> {
    const startedAt = new Date();
    const queue = await this.sources.findFetchable();
    const results: SourceFetchResult[] = [];

    const worker = async () => {
      for (let source = queue.shift(); source; source = queue.shift()) {
        results.push(await this.fetchSource(source));
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    const run: IngestionRun = {
      startedAt,
      finishedAt: new Date(),
      sources: results.length,
      succeeded: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      inserted: results.reduce((sum, r) => sum + r.inserted, 0),
    };
    this.lastRun = run;
    await this.stories.clusterPending();
    this.logger.log(
      `Ingestion finished: ${run.succeeded}/${run.sources} sources ok, ${run.inserted} new articles`,
    );
    return run;
  }
}
