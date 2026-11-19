import { describe, expect, it } from 'vitest';
import { digestMessage, escapeHtml, storyMessage } from './telegram.format.js';

const story = {
  title: 'BDU-ya yeni rektor təyin olunub',
  summary: 'Prezident sərəncam imzalayıb.',
  url: 'https://miqyas.site/xeber/bdu-rektor-a1',
  sourceCount: 12,
  category: 'Təhsil',
  breaking: false,
};

describe('escapeHtml', () => {
  it('escapes Telegram HTML entities', () => {
    expect(escapeHtml('<b> & "x"')).toBe('&lt;b&gt; &amp; &quot;x&quot;');
  });
});

describe('storyMessage', () => {
  it('includes title, summary, source count and link', () => {
    const text = storyMessage(story);
    expect(text).toContain('<b>BDU-ya yeni rektor təyin olunub</b>');
    expect(text).toContain('12 mənbə yazıb | Təhsil');
    expect(text).toContain('href="https://miqyas.site/xeber/bdu-rektor-a1"');
    expect(text).not.toContain('Son dəqiqə');
  });

  it('marks breaking stories', () => {
    expect(storyMessage({ ...story, breaking: true }).startsWith('🔴 <b>Son dəqiqə</b>')).toBe(true);
  });

  it('escapes user content', () => {
    expect(storyMessage({ ...story, title: 'A <script>' })).toContain('A &lt;script&gt;');
  });
});

describe('digestMessage', () => {
  it('numbers entries and links the site', () => {
    const text = digestMessage('19 noyabr', [{ title: 'Xəbər', url: 'https://miqyas.site/xeber/a', sourceCount: 5 }], 'https://miqyas.site');
    expect(text).toContain('1. <a href="https://miqyas.site/xeber/a">Xəbər</a> (5 mənbə)');
    expect(text).toContain('miqyas.site</a>');
  });
});
