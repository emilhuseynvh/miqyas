import type { MetadataRoute } from "next";
import { getCategories, getNews, getSources } from "@/lib/data";
import { absoluteUrl, articleIndexable } from "@/lib/seo";

const STATIC_PAGES = ["/icmal", "/menbeler", "/haqqimizda", "/menbe-siyaseti", "/mexfilik", "/elaqe"];
const ARTICLE_PAGES = 10;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, sources, latest] = await Promise.all([getCategories(), getSources(), getNews({ limit: 1 })]);
  const lastModified = latest.items[0]?.publishedAt ?? undefined;

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "always", priority: 1 },
    ...categories.map((category) => ({
      url: absoluteUrl(`/kateqoriya/${category.slug}`),
      lastModified,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...sources.map((source) => ({
      url: absoluteUrl(`/menbe/${source.slug}`),
      changeFrequency: "hourly" as const,
      priority: 0.5,
    })),
    ...STATIC_PAGES.map((path) => ({ url: absoluteUrl(path), changeFrequency: "monthly" as const, priority: 0.3 })),
  ];

  if (articleIndexable) {
    const pages = await Promise.all(
      Array.from({ length: ARTICLE_PAGES }, (_, i) => getNews({ page: i + 1, limit: 100 })),
    );
    for (const item of pages.flatMap((page) => page.items)) {
      entries.push({ url: absoluteUrl(`/xeber/${item.slug}`), lastModified: item.publishedAt, priority: 0.6 });
    }
  }
  return entries;
}
