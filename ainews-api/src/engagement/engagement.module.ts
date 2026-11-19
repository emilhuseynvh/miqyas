import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity.js';
import { RecommendationsModule } from '../recommendations/recommendations.module.js';
import { EngagementController } from './engagement.controller.js';
import { EngagementService } from './engagement.service.js';
import { ArticleReaction } from './entities/article-reaction.entity.js';
import { ReadingHistory } from './entities/reading-history.entity.js';
import { SavedArticle } from './entities/saved-article.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ArticleReaction, SavedArticle, ReadingHistory]),
    RecommendationsModule,
  ],
  controllers: [EngagementController],
  providers: [EngagementService],
})
export class EngagementModule {}
