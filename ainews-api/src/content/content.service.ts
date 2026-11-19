import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity.js';
import { ArticleExtractorService } from './article-extractor.service.js';

const BATCH_SIZE = 120;
const CONCURRENCY = 6;
const BACKLOG_WINDOW_MS = 48 * 60 * 60 * 1000;

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);
  private running = false;

  constructor(
    @InjectRepository(Article) private readonly articles: Repository<Article>,
    private readonly extractor: ArticleExtractorService,
  ) {}

  async ensureContent(article: Article): Promise<Article> {
    if (article.contentExtractedAt) return article;
    await this.extractOne(article);
    return article;
  }

  async processBacklog(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const queue = await this.articles.find({
        select: { id: true, title: true, url: true, content: true, contentExtractedAt: true },
        where: {
          contentExtractedAt: IsNull(),
          publishedAt: MoreThan(new Date(Date.now() - BACKLOG_WINDOW_MS)),
        },
        order: { publishedAt: 'DESC' },
        take: BATCH_SIZE,
      });
      if (queue.length === 0) return;

      let extracted = 0;
      const worker = async () => {
        for (let article = queue.shift(); article; article = queue.shift()) {
          if (await this.extractOne(article)) extracted++;
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
      this.logger.log(`Full text extracted for ${extracted} articles`);
    } finally {
      this.running = false;
    }
  }

  private async extractOne(article: Article): Promise<boolean> {
    const content = await this.extractor.extract(article.url, article.title).catch(() => null);
    article.content = content;
    article.contentExtractedAt = new Date();
    await this.articles.update(article.id, {
      content,
      contentExtractedAt: article.contentExtractedAt,
    });
    return content !== null;
  }
}
