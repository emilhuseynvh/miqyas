import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ingestionConfig } from '../config/configuration.js';
import { TelegramService } from './telegram.service.js';

@Injectable()
export class TelegramScheduler {
  constructor(
    private readonly telegram: TelegramService,
    @Inject(ingestionConfig.KEY) private readonly config: ConfigType<typeof ingestionConfig>,
  ) {}

  @Cron('*/5 * * * *')
  async postStory(): Promise<void> {
    if (this.config.enabled) await this.telegram.postNextStory();
  }

  @Cron('*/10 8-10 * * *', { timeZone: 'Asia/Baku' })
  async postDigest(): Promise<void> {
    if (this.config.enabled) await this.telegram.postMorningDigest();
  }
}
