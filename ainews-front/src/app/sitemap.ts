import type { MetadataRoute } from "next";
import { getCategories, getNews, getSources, getSummarized } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

const STATIC_PAGES = ["/son-xeberler", "/icmal", "/menbeler", "/haqqimizda", "/menbe-siyaseti", "/mexfilik", "/elaqe", "/reklam"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, sources, latest, summarized] = await Promise.all([
    getCategories(),
    getSources(),
    getNews({ limit: 1 }),
    getSummarized(),
  ]);
  const lastModified = latest.items[0]?.publishedAt ?? undefined;

  return [
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
    ...summarized.map((item) => ({
      url: absoluteUrl(`/xeber/${item.slug}`),
      lastModified: item.summarizedAt,
      priority: 0.6,
    })),
  ];
}
