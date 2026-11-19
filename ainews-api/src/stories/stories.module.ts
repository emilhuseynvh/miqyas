import { Module } from '@nestjs/common';
import { StoriesScheduler } from './stories.scheduler.js';
import { StoriesService } from './stories.service.js';
import { TrendingService } from './trending.service.js';

@Module({
  providers: [StoriesService, StoriesScheduler, TrendingService],
  exports: [StoriesService, TrendingService],
})
export class StoriesModule {}
