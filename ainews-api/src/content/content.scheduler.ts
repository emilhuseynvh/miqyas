import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ingestionConfig } from '../config/configuration.js';
import { ContentService } from './content.service.js';

@Injectable()
export class ContentScheduler {
  constructor(
    private readonly content: ContentService,
    @Inject(ingestionConfig.KEY) private readonly config: ConfigType<typeof ingestionConfig>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async onSchedule(): Promise<void> {
    if (this.config.enabled) await this.content.processBacklog();
  }
}
