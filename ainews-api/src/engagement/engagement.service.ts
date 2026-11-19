import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity.js';
import { FeedService } from '../recommendations/feed.service.js';
import { type Paginated, paginate, type PaginationQueryDto } from '../common/pagination.js';
import { ArticleReaction } from './entities/article-reaction.entity.js';
import { ReadingHistory } from './entities/reading-history.entity.js';
import { SavedArticle } from './entities/saved-article.entity.js';

export type ReactionValue = -1 | 0 | 1;

export type ArticleStats = {
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
};

export type ArticleUserState = {
  reaction: ReactionValue;
  saved: boolean;
};

@Injectable()
export class EngagementService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly feed: FeedService,
    @InjectRepository(Article) private readonly articles: Repository<Article>,
    @InjectRepository(SavedArticle) private readonly saved: Repository<SavedArticle>,
    @InjectRepository(ReadingHistory) private readonly history: Repository<ReadingHistory>,
    @InjectRepository(ArticleReaction) private readonly reactions: Repository<ArticleReaction>,
  ) {}

  async recordView(
    articleId: string,
    userId?: string,
    fromExploration = false,
  ): Promise<ArticleStats> {
    const { affected } = await this.articles.increment({ id: articleId }, 'viewCount', 1);
    if (!affected) throw new NotFoundException('Article not found');

    if (userId) {
      await this.dataSource.query(
        `INSERT INTO reading_history (user_id, article_id, read_at, from_exploration)
         VALUES ($1, $2, now(), $3)
         ON CONFLICT (user_id, article_id) DO UPDATE
            SET read_at = now(),
                from_exploration = reading_history.from_exploration OR EXCLUDED.from_exploration`,
        [userId, articleId, fromExploration],
      );
      this.feed.invalidate(userId);
    }
    const article = await this.articles.findOneOrFail({
      where: { id: articleId },
      select: { id: true, viewCount: true, likeCount: true, dislikeCount: true },
    });
    return this.stats(article);
  }

  async react(userId: string, articleId: string, value: ReactionValue): Promise<ArticleStats> {
    this.feed.invalidate(userId);
    return this.dataSource.transaction(async (manager) => {
      const article = await manager.findOne(Article, {
        where: { id: articleId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!article) throw new NotFoundException('Article not found');

      const existing = await manager.findOneBy(ArticleReaction, { userId, articleId });
      const previous = existing?.value ?? 0;
      if (previous === value) return this.stats(article);

      if (value === 0) await manager.delete(ArticleReaction, { userId, articleId });
      else
        await manager.upsert(ArticleReaction, { userId, articleId, value }, [
          'userId',
          'articleId',
        ]);

      article.likeCount += (value === 1 ? 1 : 0) - (previous === 1 ? 1 : 0);
      article.dislikeCount += (value === -1 ? 1 : 0) - (previous === -1 ? 1 : 0);
      await manager.update(Article, articleId, {
        likeCount: article.likeCount,
        dislikeCount: article.dislikeCount,
      });
      return this.stats(article);
    });
  }

  async userState(userId: string, articleId: string): Promise<ArticleUserState> {
    const [reaction, saved] = await Promise.all([
      this.reactions.findOneBy({ userId, articleId }),
      this.saved.existsBy({ userId, articleId }),
    ]);
    return { reaction: reaction?.value ?? 0, saved };
  }

  async save(userId: string, articleId: string): Promise<void> {
    const exists = await this.articles.existsBy({ id: articleId });
    if (!exists) throw new NotFoundException('Article not found');
    await this.saved.upsert({ userId, articleId }, ['userId', 'articleId']);
    this.feed.invalidate(userId);
  }

  async unsave(userId: string, articleId: string): Promise<void> {
    await this.saved.delete({ userId, articleId });
    this.feed.invalidate(userId);
  }

  async listSaved(userId: string, query: PaginationQueryDto): Promise<Paginated<SavedArticle>> {
    const [items, total] = await this.saved
      .createQueryBuilder('saved')
      .innerJoinAndSelect('saved.article', 'article')
      .innerJoinAndSelect('article.source', 'source')
      .leftJoinAndSelect('article.category', 'category')
      .where('saved.userId = :userId', { userId })
      .orderBy('saved.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
    return paginate(items, total, query);
  }

  async listHistory(userId: string, query: PaginationQueryDto): Promise<Paginated<ReadingHistory>> {
    const [items, total] = await this.history
      .createQueryBuilder('entry')
      .innerJoinAndSelect('entry.article', 'article')
      .innerJoinAndSelect('article.source', 'source')
      .leftJoinAndSelect('article.category', 'category')
      .where('entry.userId = :userId', { userId })
      .orderBy('entry.readAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
    return paginate(items, total, query);
  }

  async clearHistory(userId: string): Promise<void> {
    await this.history.delete({ userId });
    this.feed.invalidate(userId);
  }

  private stats(article: Article): ArticleStats {
    return {
      viewCount: article.viewCount,
      likeCount: article.likeCount,
      dislikeCount: article.dislikeCount,
    };
  }
}
