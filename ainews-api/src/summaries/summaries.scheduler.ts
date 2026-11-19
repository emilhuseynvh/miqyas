import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ingestionConfig } from '../config/configuration.js';
import { SummariesService } from './summaries.service.js';

const BATCH = 5;
const GAP_MS = 6_000;

@Injectable()
export class SummariesScheduler {
  constructor(
    private readonly summaries: SummariesService,
    @Inject(ingestionConfig.KEY) private readonly config: ConfigType<typeof ingestionConfig>,
  ) {}

  @Cron('*/2 * * * *')
  async run(): Promise<void> {
    if (this.config.enabled) await this.summaries.summarizeNext(BATCH, GAP_MS);
  }
}
