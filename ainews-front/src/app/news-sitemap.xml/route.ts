import { getSummarized } from "@/lib/data";
import { absoluteUrl, NEWS_SITEMAP_HOURS } from "@/lib/seo";
import { site } from "@/lib/site";

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET() {
  const items = await getSummarized(NEWS_SITEMAP_HOURS);
  const urls = items
    .map(
      (item) => `  <url>
    <loc>${escape(absoluteUrl(`/xeber/${item.slug}`))}</loc>
    <news:news>
      <news:publication><news:name>${escape(site.name)}</news:name><news:language>az</news:language></news:publication>
      <news:publication_date>${new Date(item.publishedAt).toISOString()}</news:publication_date>
      <news:title>${escape(item.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
