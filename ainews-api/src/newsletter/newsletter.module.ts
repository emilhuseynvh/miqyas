import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from '../articles/articles.module.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { MailModule } from '../mail/mail.module.js';
import { DigestScheduler } from './digest.scheduler.js';
import { DigestService } from './digest.service.js';
import { Subscriber } from './entities/subscriber.entity.js';
import { NewsletterController } from './newsletter.controller.js';
import { NewsletterService } from './newsletter.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber]), ArticlesModule, CategoriesModule, MailModule],
  controllers: [NewsletterController],
  providers: [NewsletterService, DigestService, DigestScheduler],
  exports: [NewsletterService],
})
export class NewsletterModule {}
