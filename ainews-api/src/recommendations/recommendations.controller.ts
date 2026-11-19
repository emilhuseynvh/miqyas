import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { OptionalUser } from '../auth/decorators/optional-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import { Category } from '../categories/entities/category.entity.js';
import { FeedQueryDto } from './dto/feed-query.dto.js';
import { InterestsDto } from './dto/interests.dto.js';
import { HiddenArticle } from './entities/hidden-article.entity.js';
import { UserInterest } from './entities/user-interest.entity.js';
import { type Feed, FeedService } from './feed.service.js';

@Controller()
export class RecommendationsController {
  constructor(
    private readonly feed: FeedService,
    @InjectRepository(HiddenArticle) private readonly hidden: Repository<HiddenArticle>,
    @InjectRepository(UserInterest) private readonly interests: Repository<UserInterest>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Article) private readonly articles: Repository<Article>,
  ) {}

  @Public()
  @Get('feed')
  getFeed(@Query() query: FeedQueryDto, @OptionalUser() user?: AuthUser): Promise<Feed> {
    return this.feed.getFeed(user?.id, query.page, query.limit);
  }

  @Put('me/hidden/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hide(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    if (!(await this.articles.existsBy({ id }))) throw new NotFoundException('Article not found');
    await this.hidden.upsert({ userId: user.id, articleId: id }, ['userId', 'articleId']);
    this.feed.invalidate(user.id);
  }

  @Get('me/interests')
  async getInterests(@CurrentUser() user: AuthUser): Promise<{ categories: string[] }> {
    const rows = await this.interests.findBy({ userId: user.id });
    const categories = await this.categories.findBy({ id: In(rows.map((r) => r.categoryId)) });
    return { categories: categories.map((c) => c.slug) };
  }

  @Put('me/interests')
  async setInterests(
    @CurrentUser() user: AuthUser,
    @Body() dto: InterestsDto,
  ): Promise<{ categories: string[] }> {
    const categories = dto.categories.length
      ? await this.categories.findBy({ slug: In(dto.categories) })
      : [];
    await this.interests.manager.transaction(async (manager) => {
      await manager.delete(UserInterest, { userId: user.id });
      if (categories.length > 0) {
        await manager.insert(
          UserInterest,
          categories.map((c) => ({ userId: user.id, categoryId: c.id })),
        );
      }
    });
    this.feed.invalidate(user.id);
    return { categories: categories.map((c) => c.slug) };
  }
}
