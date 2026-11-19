import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ingestionConfig } from '../config/configuration.js';
import { DigestService } from './digest.service.js';

@Injectable()
export class DigestScheduler {
  constructor(
    private readonly digest: DigestService,
    @Inject(ingestionConfig.KEY) private readonly config: ConfigType<typeof ingestionConfig>,
  ) {}

  @Cron('*/10 8-11 * * *', { timeZone: 'Asia/Baku' })
  async sendMorningDigest(): Promise<void> {
    if (this.config.enabled) await this.digest.sendDue();
  }
}
