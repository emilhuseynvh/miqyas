import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity.js';
import { ArticleExtractorService } from './article-extractor.service.js';
import { ContentScheduler } from './content.scheduler.js';
import { ContentService } from './content.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  providers: [ArticleExtractorService, ContentService, ContentScheduler],
  exports: [ContentService, ArticleExtractorService],
})
export class ContentModule {}
