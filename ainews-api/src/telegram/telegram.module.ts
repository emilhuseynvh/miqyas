import { Module } from '@nestjs/common';
import { StoriesModule } from '../stories/stories.module.js';
import { TelegramClient } from './telegram.client.js';
import { TelegramScheduler } from './telegram.scheduler.js';
import { TelegramService } from './telegram.service.js';

@Module({
  imports: [StoriesModule],
  providers: [TelegramClient, TelegramService, TelegramScheduler],
})
export class TelegramModule {}
