import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { ingestionConfig } from '../config/configuration.js';
import { IngestionService } from './ingestion.service.js';

@Injectable()
export class IngestionScheduler {
  constructor(
    private readonly ingestion: IngestionService,
    @Inject(ingestionConfig.KEY) private readonly config: ConfigType<typeof ingestionConfig>,
  ) {}

  @Timeout(5_000)
  async onStartup(): Promise<void> {
    if (this.config.enabled) await this.ingestion.runAll();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async onSchedule(): Promise<void> {
    if (this.config.enabled) await this.ingestion.runAll();
  }
}
