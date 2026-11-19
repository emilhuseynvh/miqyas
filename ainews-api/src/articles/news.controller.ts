import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';
import { CategoriesService } from '../categories/categories.service.js';
import type { Paginated } from '../common/pagination.js';
import { ContentService } from '../content/content.service.js';
import { SourcesService } from '../sources/sources.service.js';
import { ArticlesService } from './articles.service.js';
import { NewsDetailDto, NewsItemDto } from './dto/news-item.dto.js';
import { NewsQueryDto } from './dto/news-query.dto.js';

@Public()
@Controller('news')
export class NewsController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly categories: CategoriesService,
    private readonly content: ContentService,
    private readonly sources: SourcesService,
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
