import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { NewsItemDto } from '../articles/dto/news-item.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { OptionalUser } from '../auth/decorators/optional-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import { type Paginated, PaginationQueryDto } from '../common/pagination.js';
import { ReactionDto } from './dto/reaction.dto.js';
import { RecordViewDto } from './dto/record-view.dto.js';
import {
  type ArticleStats,
  type ArticleUserState,
  EngagementService,
} from './engagement.service.js';

type Timestamped = NewsItemDto & { at: Date };

@Controller()
export class EngagementController {
  constructor(private readonly engagement: EngagementService) {}

  @Public()
  @Post('news/:id/view')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  recordView(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordViewDto,
    @OptionalUser() user?: AuthUser,
  ): Promise<ArticleStats> {
    return this.engagement.recordView(id, user?.id, dto.exploration === true);
  }

  @Put('news/:id/reaction')
  react(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReactionDto,
  ): Promise<ArticleStats> {
    return this.engagement.react(user.id, id, dto.value);
  }

  @Get('me/articles/:id/state')
  state(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ArticleUserState> {
    return this.engagement.userState(user.id, id);
  }

  @Put('me/saved/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  save(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.engagement.save(user.id, id);
  }

  @Delete('me/saved/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  unsave(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.engagement.unsave(user.id, id);
  }

  @Get('me/saved')
  async listSaved(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ): Promise<Paginated<Timestamped>> {
    const page = await this.engagement.listSaved(user.id, query);
    return {
      ...page,
      items: page.items.map((s) => ({ ...NewsItemDto.from(s.article), at: s.createdAt })),
    };
  }

  @Get('me/history')
  async listHistory(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ): Promise<Paginated<Timestamped>> {
    const page = await this.engagement.listHistory(user.id, query);
    return {
      ...page,
      items: page.items.map((h) => ({ ...NewsItemDto.from(h.article), at: h.readAt })),
    };
  }

  @Delete('me/history')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearHistory(@CurrentUser() user: AuthUser): Promise<void> {
    return this.engagement.clearHistory(user.id);
  }
}
