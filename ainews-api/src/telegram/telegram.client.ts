import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { telegramConfig } from '../config/configuration.js';

const API = 'https://api.telegram.org';
const TIMEOUT_MS = 20_000;

export class TelegramError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter?: number,
  ) {
    super(message);
  }
}

type TelegramResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
  parameters?: { retry_after?: number };
};

@Injectable()
export class TelegramClient {
  constructor(@Inject(telegramConfig.KEY) private readonly config: ConfigType<typeof telegramConfig>) {}

  get enabled(): boolean {
    return Boolean(this.config.botToken && this.config.channelId);
  }

  async sendMessage(text: string, previewUrl?: string): Promise<number> {
    const message = await this.call<{ message_id: number }>('sendMessage', {
      chat_id: this.config.channelId,
      text,
      parse_mode: 'HTML',
      link_preview_options: previewUrl
        ? { url: previewUrl, prefer_large_media: true, show_above_text: true }
        : { is_disabled: true },
    });
    return message.message_id;
  }

  async channelTitle(): Promise<string> {
    const chat = await this.call<{ title?: string; username?: string }>('getChat', {
      chat_id: this.config.channelId,
    });
    return chat.title ?? chat.username ?? String(this.config.channelId);
  }

  private async call<T>(method: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${API}/bot${this.config.botToken}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as TelegramResponse<T>;
    if (!data.ok || data.result === undefined) {
      throw new TelegramError(
        data.description ?? `Telegram ${method} failed`,
        response.status,
        data.parameters?.retry_after,
      );
    }
    return data.result;
  }
}
