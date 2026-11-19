import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from '../articles/articles.module.js';
import { Article } from '../articles/entities/article.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { HiddenArticle } from './entities/hidden-article.entity.js';
import { UserInterest } from './entities/user-interest.entity.js';
import { FeedService } from './feed.service.js';
import { InterestProfileService } from './interest-profile.service.js';
import { RecommendationsController } from './recommendations.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([HiddenArticle, UserInterest, Category, Article]),
    ArticlesModule,
  ],
  controllers: [RecommendationsController],
  providers: [FeedService, InterestProfileService],
  exports: [FeedService],
})
export class RecommendationsModule {}
