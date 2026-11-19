import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ingestionConfig } from '../config/configuration.js';
import { StoriesService } from './stories.service.js';

@Injectable()
export class StoriesScheduler {
  constructor(
    private readonly stories: StoriesService,
    @Inject(ingestionConfig.KEY) private readonly config: ConfigType<typeof ingestionConfig>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cluster(): Promise<void> {
    if (this.config.enabled) await this.stories.clusterPending();
  }
}
