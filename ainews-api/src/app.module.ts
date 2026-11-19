import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module.js';
import { ArticlesModule } from './articles/articles.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ClientThrottlerGuard } from './common/client-throttler.guard.js';
import {
  appConfig,
  authConfig,
  databaseConfig,
  ingestionConfig,
  mailConfig,
} from './config/configuration.js';
import { validateEnv } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { EngagementModule } from './engagement/engagement.module.js';
import { IngestionModule } from './ingestion/ingestion.module.js';
import { NewsletterModule } from './newsletter/newsletter.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';
import { SourcesModule } from './sources/sources.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, databaseConfig, authConfig, mailConfig, ingestionConfig],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    SourcesModule,
    ArticlesModule,
    IngestionModule,
    AdminModule,
    EngagementModule,
    RecommendationsModule,
    NewsletterModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ClientThrottlerGuard }],
})
export class AppModule {}
