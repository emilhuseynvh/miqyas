import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module.js';
import { IngestionModule } from '../ingestion/ingestion.module.js';
import { NewsletterModule } from '../newsletter/newsletter.module.js';
import { SourcesModule } from '../sources/sources.module.js';
import { UsersModule } from '../users/users.module.js';
import { AdminController } from './admin.controller.js';

@Module({
  imports: [SourcesModule, ArticlesModule, UsersModule, IngestionModule, NewsletterModule],
  controllers: [AdminController],
})
export class AdminModule {}
