import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticlesService } from '../articles/articles.service.js';
import type { NewsQueryDto } from '../articles/dto/news-query.dto.js';
import type { Article } from '../articles/entities/article.entity.js';
import { CategoriesService } from '../categories/categories.service.js';
import { appConfig } from '../config/configuration.js';
import { MailService } from '../mail/mail.service.js';
import { type DigestSection, renderDigestEmail } from '../mail/templates/newsletter.template.js';
import { Subscriber, SubscriberStatus } from './entities/subscriber.entity.js';
import { NewsletterService } from './newsletter.service.js';

const TIME_ZONE = 'Asia/Baku';
const BATCH_SIZE = 100;
const SEND_PAUSE_MS = 1_000;
const TOP_STORIES = 5;
const PER_SECTION = 2;
const SECTIONS = ['siyaset', 'dunya', 'iqtisadiyyat', 'cemiyyet', 'idman'];

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type DigestContent = { dateLabel: string; sections: DigestSection[] };

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);
  private sending = false;

  constructor(
    @InjectRepository(Subscriber) private readonly subscribers: Repository<Subscriber>,
    private readonly articles: ArticlesService,
    private readonly categories: CategoriesService,
    private readonly newsletter: NewsletterService,
    private readonly mail: MailService,
    @Inject(appConfig.KEY) private readonly app: ConfigType<typeof appConfig>,
  ) {}

  async build(): Promise<DigestContent> {
    const query = (overrides: Partial<NewsQueryDto>) =>
      ({ page: 1, limit: TOP_STORIES, sinceHours: 24, perSource: 1, ...overrides }) as NewsQueryDto;

    const top = await this.articles.findPublished(query({ sort: 'popular' }));
    const used = new Set(top.items.map((article) => article.id));
    const sections: DigestSection[] = [
      { title: 'Günün ən çox oxunanları', items: this.links(top.items) },
    ];

    const categories = await this.categories.findAll();
    for (const slug of SECTIONS) {
      const category = categories.find((c) => c.slug === slug);
      if (!category) continue;
      const page = await this.articles.findPublished(query({ limit: PER_SECTION + 3 }), {
        categoryId: category.id,
      });
      const items = page.items.filter((article) => !used.has(article.id)).slice(0, PER_SECTION);
      items.forEach((article) => used.add(article.id));
      sections.push({ title: category.name, items: this.links(items) });
    }

    const dateLabel = new Intl.DateTimeFormat('az-Latn-AZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: TIME_ZONE,
    }).format(new Date());
    return { dateLabel, sections };
  }

  preview(): Promise<string> {
    return this.build().then(
      (content) =>
        renderDigestEmail({
          ...content,
          siteUrl: this.app.url,
          unsubscribeUrl: this.newsletter.link('/icmal/abunelikden-cix', 'preview'),
        }).html,
    );
  }

  async sendDue(): Promise<number> {
    if (this.sending) return 0;
    this.sending = true;
    try {
      const due = await this.subscribers
        .createQueryBuilder('subscriber')
        .where('subscriber.status = :status', { status: SubscriberStatus.Active })
        .andWhere(
          `(subscriber.lastSentAt IS NULL OR subscriber.lastSentAt <
            (date_trunc('day', now() AT TIME ZONE :tz) AT TIME ZONE :tz))`,
          { tz: TIME_ZONE },
        )
        .orderBy('subscriber.createdAt', 'ASC')
        .take(BATCH_SIZE)
        .getMany();
      if (due.length === 0) return 0;

      const content = await this.build();
      if (content.sections.every((section) => section.items.length === 0)) return 0;

      let sent = 0;
      for (const subscriber of due) {
        const unsubscribeUrl = this.newsletter.link(
          '/icmal/abunelikden-cix',
          subscriber.unsubscribeToken,
        );
        try {
          await this.mail.send({
            to: subscriber.email,
            ...renderDigestEmail({ ...content, siteUrl: this.app.url, unsubscribeUrl }),
            headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
          });
          await this.subscribers.update(subscriber.id, { lastSentAt: new Date() });
          sent++;
        } catch (error) {
          this.logger.error(`Digest to ${subscriber.id} failed: ${(error as Error).message}`);
        }
        await pause(SEND_PAUSE_MS);
      }
      this.logger.log(`Daily digest sent to ${sent}/${due.length} subscribers`);
      return sent;
    } finally {
      this.sending = false;
    }
  }

  private links(articles: Article[]) {
    return articles.map((article) => ({
      title: article.title,
      url: new URL(`/xeber/${article.slug}`, this.app.url).toString(),
      source: article.source.name,
    }));
  }
}
