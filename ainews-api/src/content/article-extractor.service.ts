import { Injectable } from '@nestjs/common';
import { Readability } from '@mozilla/readability';
import { JSDOM, VirtualConsole } from 'jsdom';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 3_000_000;
const MIN_CONTENT_LENGTH = 200;
const BLOCK_SELECTOR = 'p, h2, h3, h4, li, blockquote';
const NOISE = /^(oxunub|baxış|paylaş|share|reklam|ətraflı|daha çox|tags?:|teqlər|mənbə:)/i;

const BBCODE = /\[\/?[a-z]+(=[^\]]*)?\]/gi;

const IMAGE_META = [
  'meta[property="og:image"]',
  'meta[name="twitter:image"]',
  'meta[itemprop="image"]',
];
const DESCRIPTION_META = [
  'meta[property="og:description"]',
  'meta[name="description"]',
  'meta[name="twitter:description"]',
];
const MAX_DESCRIPTION_LENGTH = 400;

export type PageData = {
  content: string | null;
  imageUrl: string | null;
  description: string | null;
};

export class ExtractionError extends Error {}

@Injectable()
export class ArticleExtractorService {
  private readonly quietConsole = new VirtualConsole();

  async extract(url: string, title: string): Promise<string> {
    const { content } = await this.read(url, title);
    if (!content) throw new ExtractionError('No readable content found');
    return content;
  }

  async read(url: string, title: string): Promise<PageData> {
    const html = await this.download(url);
    const dom = new JSDOM(html, { url, virtualConsole: this.quietConsole });
    const document = dom.window.document;
    const imageUrl = this.metaUrl(document, IMAGE_META, url);
    const description = this.metaText(document, DESCRIPTION_META);
    const parsed = new Readability(document, { charThreshold: 300 }).parse();
    dom.window.close();

    const text = parsed?.content ? this.toParagraphs(parsed.content, title) : '';
    const content = text.length >= MIN_CONTENT_LENGTH ? text : null;
    return {
      content,
      imageUrl,
      description: description ?? this.firstParagraph(content),
    };
  }

  private metaUrl(document: Document, selectors: string[], base: string): string | null {
    for (const selector of selectors) {
      const value = document.querySelector(selector)?.getAttribute('content')?.trim();
      if (!value || /logo|placeholder|default/i.test(value)) continue;
      try {
        const url = new URL(value.replace(/^(https?)\/\//i, '$1://'), base);
        if (/^https?:$/.test(url.protocol)) return url.toString();
      } catch {
        continue;
      }
    }
    return null;
  }

  private metaText(document: Document, selectors: string[]): string | null {
    for (const selector of selectors) {
      const value = this.normalize(document.querySelector(selector)?.getAttribute('content') ?? '');
      if (value.length >= 20) return value.slice(0, MAX_DESCRIPTION_LENGTH);
    }
    return null;
  }

  private firstParagraph(content: string | null): string | null {
    const first = content?.split('\n\n').find((p) => p.length >= 40);
    return first ? first.slice(0, MAX_DESCRIPTION_LENGTH) : null;
  }

  private toParagraphs(html: string, title: string): string {
    const fragment = JSDOM.fragment(html);
    const blocks = [...fragment.querySelectorAll(BLOCK_SELECTOR)];
    const nodes = blocks.length > 0 ? blocks : [fragment];
    const seen = new Set<string>();
    const normalizedTitle = this.normalize(title);

    const paragraphs = nodes
      .filter((node) => !blocks.some((other) => other !== node && other.contains(node)))
      .map((node) => this.normalize(node.textContent ?? ''))
      .filter((text) => {
        if (text.length < 2 || text === normalizedTitle || NOISE.test(text) || seen.has(text)) {
          return false;
        }
        seen.add(text);
        return true;
      });

    return paragraphs.join('\n\n');
  }

  private normalize(text: string): string {
    return text
      .replace(BBCODE, ' ')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async download(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).catch((error: Error) => {
      throw new ExtractionError(
        `Request failed: ${error.name === 'TimeoutError' ? 'timeout' : error.message}`,
      );
    });
    if (!response.ok) throw new ExtractionError(`HTTP ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer()).subarray(0, MAX_HTML_BYTES);
    const charset = this.detectCharset(response.headers.get('content-type'), buffer);
    try {
      return new TextDecoder(charset).decode(buffer);
    } catch {
      return new TextDecoder('utf-8').decode(buffer);
    }
  }

  private detectCharset(contentType: string | null, buffer: Buffer): string {
    const fromHeader = contentType?.match(/charset=([\w-]+)/i)?.[1];
    if (fromHeader) return fromHeader.toLowerCase();
    const head = buffer.subarray(0, 4096).toString('latin1');
    return head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1]?.toLowerCase() ?? 'utf-8';
  }
}
