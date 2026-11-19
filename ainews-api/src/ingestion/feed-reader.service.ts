import { Injectable } from '@nestjs/common';
import Parser from 'rss-parser';

export type FeedEntry = {
  title: string;
  url: string;
  summary: string | null;
  imageUrl: string | null;
  author: string | null;
  categories: string[];
  publishedAt: Date | null;
};

type MediaNode = { $?: { url?: string; medium?: string; type?: string } };

type CustomItem = {
  mediaContent?: MediaNode | MediaNode[];
  mediaThumbnail?: MediaNode | MediaNode[];
  enclosure?: { url?: string; type?: string };
  creator?: string;
  author?: string;
  contentSnippet?: string;
  description?: string;
  'content:encoded'?: string;
};

const USER_AGENT = 'Mozilla/5.0 (compatible; MiqyasNewsBot/1.0; +https://miqyas.site)';
const TIMEOUT_MS = 15_000;
const TRACKING_PARAMS = /^(utm_|fbclid|gclid|yclid|_ga)/i;

const MAX_CLOCK_SKEW_MS = 60 * 60 * 1000;
const HTML_FIELDS = ['description', 'content:encoded', 'content', 'summary', 'title'];

export class FeedError extends Error {}

function repairXml(xml: string): string {
  let repaired = xml.replace(/\[\/?[a-z-]+\]/gi, '');
  for (const tag of HTML_FIELDS) {
    const pattern = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'gi');
    repaired = repaired.replace(pattern, (match, attrs = '', body: string) =>
      body.includes('<![CDATA[') || !/[<&]/.test(body)
        ? match
        : `<${tag}${attrs}><![CDATA[${body.replace(/]]>/g, ']]]]><![CDATA[>')}]]></${tag}>`,
    );
  }
  return repaired.replace(/&(?!(?:[a-z][a-z0-9]*|#\d+|#x[0-9a-f]+);)/gi, '&amp;');
}

@Injectable()
export class FeedReaderService {
  private readonly parser = new Parser<Record<string, never>, CustomItem>({
    customFields: {
      item: [
        ['media:content', 'mediaContent'],
        ['media:thumbnail', 'mediaThumbnail'],
        ['description', 'description'],
      ],
    },
  });

  async read(feedUrl: string): Promise<FeedEntry[]> {
    const xml = await this.download(feedUrl);
    const feed = await this.parser
      .parseString(xml)
      .catch(() => this.parser.parseString(repairXml(xml)))
      .catch((error: Error) => {
        throw new FeedError(`Invalid feed: ${error.message.split('\n')[0]}`);
      });

    return feed.items
      .map((item) => this.toEntry(item, feedUrl))
      .filter((entry): entry is FeedEntry => entry !== null);
  }

  private async download(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'user-agent': USER_AGENT,
        accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).catch((error: Error & { cause?: { code?: string } }) => {
      const reason =
        error.name === 'TimeoutError' ? 'timeout' : (error.cause?.code ?? error.message);
      throw new FeedError(`Request failed: ${reason}`);
    });

    if (!response.ok) throw new FeedError(`HTTP ${response.status}`);
    const body = await response.text();
    if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(body))
      throw new FeedError('Response is not an RSS or Atom feed');
    return body;
  }

  private toEntry(item: Parser.Item & CustomItem, feedUrl: string): FeedEntry | null {
    const title = this.clean(item.title);
    const url = this.normalizeUrl(item.link ?? item.guid, feedUrl);
    if (!title || !url) return null;

    const publishedAt = this.parseDate(item.isoDate ?? item.pubDate);

    return {
      title: title.slice(0, 500),
      url,
      summary: this.clean(item.contentSnippet ?? item.description)?.slice(0, 2000) ?? null,
      imageUrl: this.pickImage(item, feedUrl),
      author: this.clean(item.creator ?? item.author)?.slice(0, 200) ?? null,
      categories: (item.categories ?? [])
        .map((c) => this.clean(typeof c === 'string' ? c : String((c as { _?: string })._ ?? '')))
        .filter((c): c is string => Boolean(c))
        .slice(0, 10),
      publishedAt,
    };
  }

  private parseDate(value: string | undefined): Date | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const now = Date.now();
    return date.getTime() > now + MAX_CLOCK_SKEW_MS ? new Date(now) : date;
  }

  private pickImage(item: CustomItem & { content?: string }, base: string): string | null {
    const media = [item.mediaContent, item.mediaThumbnail].flat().filter(Boolean) as MediaNode[];
    const fromMedia = media.find((m) => m.$?.url && (!m.$.medium || m.$.medium === 'image'))?.$
      ?.url;
    const fromEnclosure = item.enclosure?.type?.startsWith('image')
      ? item.enclosure.url
      : undefined;
    const html = item['content:encoded'] ?? item.content ?? item.description ?? '';
    const fromHtml = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
    const candidate = fromMedia ?? fromEnclosure ?? fromHtml;
    if (!candidate || /logo/i.test(candidate)) return null;
    return this.normalizeUrl(candidate, base, false);
  }

  private normalizeUrl(raw: string | undefined, base: string, stripTracking = true): string | null {
    if (!raw) return null;
    try {
      const url = new URL(raw.trim().replace(/^(https?)\/\//i, '$1://'), base);
      if (!/^https?:$/.test(url.protocol)) return null;
      url.hash = '';
      if (stripTracking) {
        for (const key of [...url.searchParams.keys()]) {
          if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key);
        }
      }
      return url.toString();
    } catch {
      return null;
    }
  }

  private clean(value: string | undefined | null): string | null {
    if (!value) return null;
    const text = value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;|&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    return text || null;
  }
}
