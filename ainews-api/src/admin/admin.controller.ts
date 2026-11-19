import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ArticlesService } from '../articles/articles.service.js';
import { ArticleQueryDto } from '../articles/dto/article-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { IngestionService } from '../ingestion/ingestion.service.js';
import { NewsletterService } from '../newsletter/newsletter.service.js';
import { SourceQueryDto } from '../sources/dto/source-query.dto.js';
import { CreateSourceDto, UpdateSourceDto } from '../sources/dto/upsert-source.dto.js';
import { SourcesService } from '../sources/sources.service.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { UsersService } from '../users/users.service.js';

@Roles(UserRole.Admin)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly sources: SourcesService,
    private readonly articles: ArticlesService,
    private readonly users: UsersService,
    private readonly ingestion: IngestionService,
    private readonly newsletter: NewsletterService,
  ) {}

  @Get('overview')
  async overview() {
    const [sources, articles, users, subscribers] = await Promise.all([
      this.sources.countByStatus(),
      this.articles.stats(),
      this.users.count(),
      this.newsletter.countActive(),
    ]);
    return { sources, articles, users, subscribers, ingestion: this.ingestion.status };
  }

  @Get('sources')
  findSources(@Query() query: SourceQueryDto) {
    return this.sources.findPage(query);
  }

  @Post('sources')
  createSource(@Body() dto: CreateSourceDto) {
    return this.sources.create(dto);
  }

  @Patch('sources/:id')
  updateSource(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSourceDto) {
    return this.sources.update(id, dto);
  }

  @Post('sources/:id/fetch')
  @HttpCode(HttpStatus.OK)
  async fetchSource(@Param('id', ParseUUIDPipe) id: string) {
    const source = await this.sources.findOne(id);
    return this.ingestion.fetchSource(source);
  }

  @Post('ingestion/run')
  @HttpCode(HttpStatus.ACCEPTED)
  runIngestion() {
    void this.ingestion.runAll();
    return this.ingestion.status;
  }

  @Get('articles')
  findArticles(@Query() query: ArticleQueryDto) {
    return this.articles.findPage(query);
  }
}
