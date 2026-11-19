import { absoluteUrl, articleCanonical } from "./seo";
import { site } from "./site";
import type { NewsItem } from "./types";

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderRss(input: { title: string; path: string; description: string; items: NewsItem[] }): Response {
  const items = input.items
    .map(
      (item) => `    <item>
      <title>${escape(item.title)}</title>
      <link>${escape(articleCanonical(item))}</link>
      <guid isPermaLink="true">${escape(articleCanonical(item))}</guid>
      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
      <source url="${escape(item.source.siteUrl)}">${escape(item.source.name)}</source>${
        item.category ? `\n      <category>${escape(item.category.name)}</category>` : ""
      }${item.summary ? `\n      <description>${escape(item.summary)}</description>` : ""}${
        item.imageUrl ? `\n      <enclosure url="${escape(item.imageUrl)}" type="image/jpeg" length="0" />` : ""
      }
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(input.title)}</title>
    <link>${escape(absoluteUrl(input.path))}</link>
    <atom:link href="${escape(absoluteUrl(input.path === "/" ? "/rss.xml" : `${input.path}/rss.xml`))}" rel="self" type="application/rss+xml" />
    <description>${escape(input.description)}</description>
    <language>az</language>
    <copyright>${escape(`© ${site.name}. Xəbərlərin hüquqları orijinal mənbələrə məxsusdur.`)}</copyright>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}
