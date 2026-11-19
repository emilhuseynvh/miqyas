import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module.js';
import { ContentModule } from '../content/content.module.js';
import { SourcesModule } from '../sources/sources.module.js';
import { StoriesModule } from '../stories/stories.module.js';
import { ArticlesService } from './articles.service.js';
import { Article } from './entities/article.entity.js';
import { NewsController } from './news.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), CategoriesModule, ContentModule, SourcesModule, StoriesModule],
  controllers: [NewsController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
