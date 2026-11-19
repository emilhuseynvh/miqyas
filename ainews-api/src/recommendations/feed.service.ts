import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ArticlesService,
  AZ_LETTERS,
  PRIMARY_ONLY,
  PUBLIC_LANGUAGE,
} from '../articles/articles.service.js';
import { NewsItemDto } from '../articles/dto/news-item.dto.js';
import type { Article } from '../articles/entities/article.entity.js';
import { InterestProfileService } from './interest-profile.service.js';
import { emptyProfile, type InterestProfile } from './profile.js';
import { type Candidate, type Ranked, rerank, scoreCandidates } from './ranking.js';

const CANDIDATE_WINDOW_HOURS = 48;
const CANDIDATE_LIMIT = 1500;
const RANKED_LIMIT = 200;
const CACHE_TTL_MS = 3 * 60 * 1000;
const COLD_START_SIGNALS = 5;
const MAX_IGNORED_IMPRESSIONS = 3;
const IMPRESSION_COOLDOWN_MINUTES = 30;
const STRONG_INTEREST = 0.5;
const SHORT_TERM_SURGE = 0.6;
const LONG_TERM_WEAK = 0.3;
const POPULAR_THRESHOLD = 0.6;

export type FeedItem = NewsItemDto & { reason: string; exploration: boolean };

export type Feed = {
  items: FeedItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  personalized: boolean;
  needsOnboarding: boolean;
};

type CachedRanking = {
  ranked: Ranked[];
  profile: InterestProfile;
  expiresAt: number;
};

type CandidateRow = {
  id: string;
  title: string;
  category_id: number | null;
  source_id: string;
  published_at: Date;
  view_count: number;
  like_count: number;
  dislike_count: number;
};

@Injectable()
export class FeedService {
  private readonly cache = new Map<string, CachedRanking>();

  constructor(
    private readonly dataSource: DataSource,
    private readonly articles: ArticlesService,
    private readonly profiles: InterestProfileService,
  ) {}

  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  async getFeed(userId: string | undefined, page: number, limit: number): Promise<Feed> {
    const { ranked, profile } = await this.ranking(userId);
    const slice = ranked.slice((page - 1) * limit, page * limit);
    const articles = await this.articles.findPublishedByIds(slice.map((item) => item.id));
    const byId = new Map(articles.map((article) => [article.id, article]));

    const items = slice.flatMap((item) => {
      const article = byId.get(item.id);
      return article
        ? [
            {
              ...NewsItemDto.from(article),
              reason: this.reason(item, article, profile),
              exploration: item.exploration,
            },
          ]
        : [];
    });

    if (userId)
      await this.recordImpressions(
        userId,
        items.map((item) => item.id),
      );

    const hasSignals = profile.signals >= COLD_START_SIGNALS || profile.explicit.size > 0;
    return {
      items,
      page,
      limit,
      hasMore: page * limit < ranked.length,
      personalized: Boolean(userId) && hasSignals,
      needsOnboarding: Boolean(userId) && !hasSignals,
    };
  }

  private async ranking(userId: string | undefined): Promise<CachedRanking> {
    const key = userId ?? 'anonymous';
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached;

    const profile = userId ? await this.profiles.build(userId) : emptyProfile();
    const candidates = await this.candidates(userId);
    const ranked = rerank(
      scoreCandidates(candidates, profile, Date.now()),
      RANKED_LIMIT,
      profile.exploreEvery,
    );
    const entry = { ranked, profile, expiresAt: Date.now() + CACHE_TTL_MS };
    this.cache.set(key, entry);
    return entry;
  }

  private async recordImpressions(userId: string, articleIds: string[]): Promise<void> {
    if (articleIds.length === 0) return;
    await this.dataSource.query(
      `
      INSERT INTO feed_impressions (user_id, article_id)
      SELECT $1, unnest($2::uuid[])
      ON CONFLICT (user_id, article_id) DO UPDATE
         SET shown_count = feed_impressions.shown_count + 1, last_shown_at = now()
       WHERE feed_impressions.last_shown_at < now() - make_interval(mins => $3)
      `,
      [userId, articleIds, IMPRESSION_COOLDOWN_MINUTES],
    );
  }

  private async candidates(userId: string | undefined): Promise<Candidate[]> {
    const params: unknown[] = [
      PUBLIC_LANGUAGE,
      AZ_LETTERS,
      CANDIDATE_WINDOW_HOURS,
      CANDIDATE_LIMIT,
    ];
    const exclusion = userId
      ? `AND NOT EXISTS (SELECT 1 FROM reading_history h JOIN articles b ON b.id = h.article_id
                         WHERE h.user_id = $5 AND (b.id = a.id OR b.story_id = a.story_id))
         AND NOT EXISTS (SELECT 1 FROM hidden_articles x WHERE x.user_id = $5 AND x.article_id = a.id)
         AND NOT EXISTS (SELECT 1 FROM article_reactions r WHERE r.user_id = $5 AND r.article_id = a.id)
         AND NOT EXISTS (SELECT 1 FROM saved_articles v WHERE v.user_id = $5 AND v.article_id = a.id)
         AND NOT EXISTS (SELECT 1 FROM feed_impressions i WHERE i.user_id = $5 AND i.article_id = a.id AND i.shown_count >= $6)`
      : '';
    if (userId) params.push(userId, MAX_IGNORED_IMPRESSIONS);

    const rows: CandidateRow[] = await this.dataSource.query(
      `
      SELECT a.id, a.title, a.category_id, a.source_id, a.published_at,
             a.view_count, a.like_count, a.dislike_count
        FROM articles a JOIN sources s ON s.id = a.source_id
       WHERE s.language = $1 AND s.is_active = true
         AND a.title ~ $2
         AND a.image_url IS NOT NULL
         AND a.published_at > now() - make_interval(hours => $3)
         AND ${PRIMARY_ONLY('a')}
         ${exclusion}
       ORDER BY a.published_at DESC
       LIMIT $4
      `,
      params,
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      categoryId: row.category_id === null ? null : Number(row.category_id),
      sourceId: row.source_id,
      publishedAt: new Date(row.published_at),
      viewCount: row.view_count,
      likeCount: row.like_count,
      dislikeCount: row.dislike_count,
    }));
  }

  private reason(item: Ranked, article: Article, profile: InterestProfile): string {
    const category = article.category?.name;
    const categoryId = article.categoryId;
    if (item.exploration) return category ? `Kəşf et: ${category}` : 'Kəşf et';
    if (categoryId !== null && profile.explicit.has(categoryId) && category) {
      return `Seçdiyin mövzu: ${category}`;
    }
    if (item.parts.keyword >= STRONG_INTEREST && item.parts.keywordStem) {
      const label = profile.keywordLabels.get(item.parts.keywordStem) ?? item.parts.keywordStem;
      return `"${label.charAt(0).toLocaleUpperCase('az')}${label.slice(1)}" mövzusunu izləyirsən`;
    }
    if (categoryId !== null) {
      const shortTerm = profile.shortTermCategories.get(categoryId) ?? 0;
      const longTerm = profile.longTermCategories.get(categoryId) ?? 0;
      if (shortTerm >= SHORT_TERM_SURGE && longTerm < LONG_TERM_WEAK) {
        return 'Son oxuduqlarına əsasən';
      }
    }
    if (item.parts.category >= STRONG_INTEREST && category) {
      return `${category} xəbərlərini çox oxuyursan`;
    }
    if (item.parts.source >= STRONG_INTEREST) return `${article.source.name} saytını çox oxuyursan`;
    if (item.parts.popularity >= POPULAR_THRESHOLD) return 'Bu gün çox oxunur';
    return 'Təzə xəbər';
  }
}
