import { Module } from '@nestjs/common';
import { StoriesScheduler } from './stories.scheduler.js';
import { StoriesService } from './stories.service.js';

@Module({
  providers: [StoriesService, StoriesScheduler],
  exports: [StoriesService],
})
export class StoriesModule {}
