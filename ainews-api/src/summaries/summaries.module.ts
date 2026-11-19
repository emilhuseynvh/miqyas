import { Module } from '@nestjs/common';
import { StoriesModule } from '../stories/stories.module.js';
import { GeminiClient } from './gemini.client.js';
import { SummariesScheduler } from './summaries.scheduler.js';
import { SummariesService } from './summaries.service.js';

@Module({
  imports: [StoriesModule],
  providers: [GeminiClient, SummariesService, SummariesScheduler],
})
export class SummariesModule {}
