import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { appConfig } from '../config/configuration.js';
import { MailService } from '../mail/mail.service.js';
import { renderConfirmEmail } from '../mail/templates/newsletter.template.js';
import { Subscriber, SubscriberStatus } from './entities/subscriber.entity.js';

export type SubscribeResult = { status: 'confirmation_sent' | 'already_subscribed' };
export type TokenResult = { status: 'ok' | 'invalid' };

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Subscriber) private readonly subscribers: Repository<Subscriber>,
    private readonly mail: MailService,
    @Inject(appConfig.KEY) private readonly app: ConfigType<typeof appConfig>,
  ) {}

  async subscribe(email: string): Promise<SubscribeResult> {
    const existing = await this.subscribers.findOneBy({ email });
    if (existing?.status === SubscriberStatus.Active) return { status: 'already_subscribed' };

    const confirmToken = randomUUID();
    if (existing) {
      await this.subscribers.update(existing.id, {
        status: SubscriberStatus.Pending,
        confirmToken,
      });
    } else {
      await this.subscribers.insert({ email, status: SubscriberStatus.Pending, confirmToken });
    }

    await this.mail.send({
      to: email,
      ...renderConfirmEmail(this.link('/icmal/tesdiq', confirmToken)),
    });
    return { status: 'confirmation_sent' };
  }

  async confirm(token: string): Promise<TokenResult> {
    const subscriber = await this.subscribers.findOneBy({ confirmToken: token });
    if (!subscriber) return { status: 'invalid' };
    await this.subscribers.update(subscriber.id, {
      status: SubscriberStatus.Active,
      confirmToken: null,
      confirmedAt: new Date(),
      unsubscribedAt: null,
    });
    return { status: 'ok' };
  }

  async unsubscribe(token: string): Promise<TokenResult> {
    const subscriber = await this.subscribers.findOneBy({ unsubscribeToken: token });
    if (!subscriber) return { status: 'invalid' };
    if (subscriber.status !== SubscriberStatus.Unsubscribed) {
      await this.subscribers.update(subscriber.id, {
        status: SubscriberStatus.Unsubscribed,
        unsubscribedAt: new Date(),
      });
    }
    return { status: 'ok' };
  }

  countActive(): Promise<number> {
    return this.subscribers.countBy({ status: SubscriberStatus.Active });
  }

  link(path: string, token: string): string {
    const url = new URL(path, this.app.url);
    url.searchParams.set('token', token);
    return url.toString();
  }
}
