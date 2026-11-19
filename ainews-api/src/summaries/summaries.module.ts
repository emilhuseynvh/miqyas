import { Module } from '@nestjs/common';
import { GeminiClient } from './gemini.client.js';
import { SummariesScheduler } from './summaries.scheduler.js';
import { SummariesService } from './summaries.service.js';

@Module({
  providers: [GeminiClient, SummariesService, SummariesScheduler],
})
export class SummariesModule {}
