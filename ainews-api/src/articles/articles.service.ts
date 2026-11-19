import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { type Paginated, paginate } from '../common/pagination.js';
import type { ArticleQueryDto } from './dto/article-query.dto.js';
import type { SummarizedItem } from './dto/news-item.dto.js';
import type { NewsQueryDto } from './dto/news-query.dto.js';
import { Article } from './entities/article.entity.js';

export const PUBLIC_LANGUAGE = 'az';
export const PRIMARY_ONLY = (a: string) =>
  `(${a}.story_id IS NULL OR EXISTS (SELECT 1 FROM stories st WHERE st.id = ${a}.story_id AND st.primary_article_id = ${a}.id))`;

export type NewsFilterIds = { categoryId?: number; sourceId?: string };

const RELATED_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const AZ_LETTERS = '[əƏğĞıİöÖüÜşŞçÇ]';

export type NewArticle = Pick<
  Article,
  | 'sourceId'
  | 'categoryId'
  | 'title'
  | 'slug'
  | 'url'
  | 'summary'
  | 'imageUrl'
  | 'author'
  | 'feedCategories'
  | 'publishedAt'
  | 'titleKey'
> &
  Partial<Pick<Article, 'content' | 'contentExtractedAt'>>;

@Injectable()
export class ArticlesService {
  constructor(@InjectRepository(Article) private readonly articles: Repository<Article>) {}

  async findExistingUrls(urls: string[]): Promise<Set<string>> {
    if (urls.length === 0) return new Set();
    const rows = await this.articles
      .createQueryBuilder('article')
      .select('article.url', 'url')
      .where('article.url IN (:...urls)', { urls })
      .getRawMany<{ url: string }>();
    return new Set(rows.map((row) => row.url));
  }

  async insertNew(items: NewArticle[]): Promise<number> {
    if (items.length === 0) return 0;
    const result = await this.articles
      .createQueryBuilder()
      .insert()
      .into(Article)
      .values(items)
      .orIgnore()
      .returning(['id'])
      .execute();
    return result.raw.length as number;
  }

  async findPage(query: ArticleQueryDto): Promise<Paginated<Article>> {
    const qb = this.articles
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.source', 'source')
      .leftJoinAndSelect('article.category', 'category')
      .orderBy('article.publishedAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    if (query.sourceId) qb.andWhere('article.sourceId = :sourceId', { sourceId: query.sourceId });
    if (query.search) qb.andWhere('article.title ILIKE :search', { search: `%${query.search}%` });

    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, query);
  }

  async findPublished(query: NewsQueryDto, ids: NewsFilterIds = {}): Promise<Paginated<Article>> {
    const params: Record<string, unknown> = {};
    const conditions: ((a: string, s: string) => string)[] = [PRIMARY_ONLY];

    if (ids.categoryId !== undefined) {
      conditions.push((a) => `${a}.category_id = :categoryId`);
      params.categoryId = ids.categoryId;
    }
    if (ids.sourceId !== undefined) {
      conditions.push((a) => `${a}.source_id = :sourceId`);
      params.sourceId = ids.sourceId;
    }
    if (query.withImage) conditions.push((a) => `${a}.image_url IS NOT NULL`);
    if (query.sinceHours) {
      conditions.push((a) => `${a}.published_at > :since`);
      params.since = new Date(Date.now() - query.sinceHours * 60 * 60 * 1000);
    }
    if (query.q) {
      conditions.push((a) => `(${a}.title ILIKE :q OR ${a}.summary ILIKE :q)`);
      params.q = `%${query.q.replace(/[%_\\]/g, '\\$&')}%`;
    }

    const qb = this.publicQuery();
    for (const condition of conditions) qb.andWhere(condition('article', 'source'), params);

    if (query.perSource) {
      const inner = ['s.language = :language', 's.is_active = true', 'a.title ~ :azLetters']
        .concat(conditions.map((condition) => condition('a', 's')))
        .join(' AND ');
      qb.andWhere(
        `article.id IN (
          SELECT ranked.id FROM (
            SELECT a.id, ROW_NUMBER() OVER (
              PARTITION BY a.source_id ORDER BY a.published_at DESC
            ) AS rn
            FROM articles a JOIN sources s ON s.id = a.source_id
            WHERE ${inner}
          ) ranked
          WHERE ranked.rn <= :perSource
        )`,
        { ...params, perSource: query.perSource },
      );
    }

    if (query.sort === 'popular') {
      qb.orderBy('article.viewCount', 'DESC').addOrderBy('article.publishedAt', 'DESC');
    }

    const [items, total] = await qb
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
    return paginate(items, total, query);
  }

  async findPublishedByKey(key: string): Promise<Article> {
    const field = UUID_PATTERN.test(key) ? 'article.id' : 'article.slug';
    const article = await this.publicQuery()
      .addSelect('article.content')
      .andWhere(`${field} = :key`, { key })
      .getOne();
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async findPublishedByIds(ids: string[]): Promise<Article[]> {
    if (ids.length === 0) return [];
    const articles = await this.publicQuery()
      .andWhere('article.id IN (:...ids)', { ids })
      .getMany();
    const byId = new Map(articles.map((article) => [article.id, article]));
    return ids.map((id) => byId.get(id)).filter((article): article is Article => Boolean(article));
  }

  findRelated(article: Article, limit = 4): Promise<Article[]> {
    const qb = this.publicQuery()
      .andWhere('article.id != :id', { id: article.id })
      .andWhere('article.sourceId != :sourceId', { sourceId: article.sourceId })
      .andWhere(PRIMARY_ONLY('article'))
      .andWhere('article.publishedAt > :since', {
        since: new Date(Date.now() - RELATED_WINDOW_MS),
      })
      .take(limit);
    if (article.categoryId) {
      qb.andWhere('article.categoryId = :categoryId', { categoryId: article.categoryId });
    }
    if (article.storyId) qb.andWhere('article.story_id <> :storyId', { storyId: article.storyId });
    return qb.getMany();
  }

  findCoverage(article: Article): Promise<Article[]> {
    if (!article.storyId) return Promise.resolve([]);
    return this.articles.find({
      where: { storyId: article.storyId },
      relations: { source: true },
      order: { publishedAt: 'ASC' },
    });
  }

  private publicQuery() {
    return this.articles
      .createQueryBuilder('article')
      .innerJoinAndSelect('article.source', 'source')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.story', 'story')
      .where('source.language = :language', { language: PUBLIC_LANGUAGE })
      .andWhere('source.isActive = true')
      .andWhere('article.title ~ :azLetters', { azLetters: AZ_LETTERS })
      .orderBy('article.publishedAt', 'DESC');
  }

  findSummarized(sinceHours: number | undefined, limit: number): Promise<SummarizedItem[]> {
    return this.articles.query(
      `SELECT a.slug, s.summary_title AS "title", a.published_at AS "publishedAt", s.summarized_at AS "summarizedAt"
         FROM stories s
         JOIN articles a ON a.id = s.primary_article_id
         JOIN sources so ON so.id = a.source_id
        WHERE s.summarized_at IS NOT NULL
          AND so.language = $1 AND so.is_active
          AND ($2::int IS NULL OR a.published_at > now() - make_interval(hours => $2::int))
        ORDER BY a.published_at DESC
        LIMIT $3`,
      [PUBLIC_LANGUAGE, sinceHours ?? null, limit],
    );
  }

  async stats(): Promise<{ total: number; last24h: number; lastHour: number }> {
    const hour = 60 * 60 * 1000;
    const [total, last24h, lastHour] = await Promise.all([
      this.articles.count(),
      this.articles.countBy({ fetchedAt: MoreThan(new Date(Date.now() - 24 * hour)) }),
      this.articles.countBy({ fetchedAt: MoreThan(new Date(Date.now() - hour)) }),
    ]);
    return { total, last24h, lastHour };
  }
}
