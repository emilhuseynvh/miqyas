import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { summaryConfig } from '../config/configuration.js';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 60_000;

export class GeminiRateLimitError extends Error {}

type GenerateInput = {
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
};

type GenerateResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

@Injectable()
export class GeminiClient {
  constructor(@Inject(summaryConfig.KEY) private readonly config: ConfigType<typeof summaryConfig>) {}

  get enabled(): boolean {
    return Boolean(this.config.apiKey);
  }

  get model(): string {
    return this.config.model;
  }

  async generateJson<T>(input: GenerateInput): Promise<T> {
    const response = await fetch(`${ENDPOINT}/${this.config.model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': this.config.apiKey ?? '' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.system }] },
        contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: input.schema,
        },
      }),
    });
    if (response.status === 429) throw new GeminiRateLimitError(await response.text());
    if (!response.ok) throw new Error(`Gemini ${response.status}: ${(await response.text()).slice(0, 300)}`);

    const data = (await response.json()) as GenerateResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned an empty response');
    return JSON.parse(text) as T;
  }
}
