import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import { mailConfig } from '../config/configuration.js';
import { type MagicLinkPurpose, renderMagicLinkEmail } from './templates/magic-link.template.js';

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

type MagicLinkMail = {
  to: string;
  purpose: MagicLinkPurpose;
  link: string;
  ttlMinutes: number;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor(@Inject(mailConfig.KEY) private readonly config: ConfigType<typeof mailConfig>) {
    this.transporter = config.host
      ? nodemailer.createTransport({
          host: config.host,
          port: config.port ?? 587,
          secure: config.secure,
          auth: config.user ? { user: config.user, pass: config.password } : undefined,
        })
      : null;
  }

  async send({ to, subject, html, text, headers }: Mail): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`SMTP is not configured. Mail "${subject}" for ${to}:\n${text}`);
      return;
    }
    await this.transporter.sendMail({ from: this.config.from, to, subject, html, text, headers });
  }

  sendMagicLink({ to, purpose, link, ttlMinutes }: MagicLinkMail): Promise<void> {
    return this.send({ to, ...renderMagicLinkEmail({ purpose, link, ttlMinutes }) });
  }
}
