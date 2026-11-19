import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';
import { CategoriesService } from '../categories/categories.service.js';
import type { Paginated } from '../common/pagination.js';
import { ContentService } from '../content/content.service.js';
import { SourcesService } from '../sources/sources.service.js';
import { ArticlesService } from './articles.service.js';
import { NewsDetailDto, NewsItemDto, type SummarizedItem } from './dto/news-item.dto.js';
import { SummarizedQueryDto } from './dto/summarized-query.dto.js';
import { TrendingQueryDto } from './dto/trending-query.dto.js';
import { TrendingService } from '../stories/trending.service.js';
import { NewsQueryDto } from './dto/news-query.dto.js';

@Public()
@Controller('news')
export class NewsController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly categories: CategoriesService,
    private readonly content: ContentService,
    private readonly sources: SourcesService,
    private readonly trendingStories: TrendingService,
  ) {}

  @Get()
  async list(@Query() query: NewsQueryDto): Promise<Paginated<NewsItemDto>> {
    let categoryId: number | undefined;
    if (query.category) {
      const category = await this.categories.findBySlug(query.category);
      if (!category) throw new NotFoundException('Category not found');
      categoryId = category.id;
    }
    const sourceId = query.source ? (await this.sources.findBySlug(query.source)).id : undefined;
    const page = await this.articles.findPublished(query, { categoryId, sourceId });
    return { ...page, items: page.items.map((item) => NewsItemDto.from(item)) };
  }

  @Get('trending')
  async trending(@Query() query: TrendingQueryDto): Promise<NewsItemDto[]> {
    const categoryId = query.category ? (await this.categories.findBySlug(query.category))?.id : undefined;
    if (query.category && categoryId === undefined) throw new NotFoundException('Category not found');
    const stories = await this.trendingStories.find({ limit: query.limit, categoryId });
    const breaking = new Set(stories.filter((story) => story.breaking).map((story) => story.articleId));
    const articles = await this.articles.findPublishedByIds(stories.map((story) => story.articleId));
    return articles.map((article) => NewsItemDto.from(article, breaking.has(article.id)));
  }

  @Get('summarized')
  summarized(@Query() query: SummarizedQueryDto): Promise<SummarizedItem[]> {
    return this.articles.findSummarized(query.hours, query.limit);
  }

  @Get(':key')
  async findOne(
    @Param('key') key: string,
  ): Promise<{ article: NewsDetailDto; related: NewsItemDto[] }> {
    const article = await this.content.ensureContent(await this.articles.findPublishedByKey(key));
    const [related, coverage] = await Promise.all([
      this.articles.findRelated(article),
      this.articles.findCoverage(article),
    ]);
    return {
      article: NewsDetailDto.fromDetail(article, coverage),
      related: related.map((item) => NewsItemDto.from(item)),
    };
  }
}
