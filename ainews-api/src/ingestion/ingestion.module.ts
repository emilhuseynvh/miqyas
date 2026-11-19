import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { ContentModule } from '../content/content.module.js';
import { SourcesModule } from '../sources/sources.module.js';
import { StoriesModule } from '../stories/stories.module.js';
import { FeedReaderService } from './feed-reader.service.js';
import { IngestionScheduler } from './ingestion.scheduler.js';
import { IngestionService } from './ingestion.service.js';

@Module({
  imports: [SourcesModule, ArticlesModule, CategoriesModule, ContentModule, StoriesModule],
  providers: [FeedReaderService, IngestionService, IngestionScheduler],
  exports: [IngestionService],
})
export class IngestionModule {}
