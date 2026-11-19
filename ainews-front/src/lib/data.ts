import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { api, ApiError } from "./api";
import type { Category, NewsDetail, NewsItem, NewsPage, NewsSource, SummarizedItem } from "./types";

export type NewsQuery = {
  category?: string;
  source?: string;
  q?: string;
  page?: number;
  limit?: number;
  withImage?: boolean;
  perSource?: number;
  sinceHours?: number;
  sort?: "latest" | "popular";
};

const toQuery = (query: NewsQuery) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  return params.toString();
};

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  return api<Category[]>("/categories", { forwardClient: false });
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

export async function getNews(query: NewsQuery): Promise<NewsPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");
  return api<NewsPage>(`/news?${toQuery(query)}`, { forwardClient: false });
}

export async function getSource(slug: string): Promise<NewsSource | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("sources");
  try {
    return await api<NewsSource>(`/sources/${encodeURIComponent(slug)}`, { forwardClient: false });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export type SourceSummary = NewsSource & { articleCount: number };

export async function getSources(): Promise<SourceSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("sources");
  return api<SourceSummary[]>("/sources", { forwardClient: false });
}

export async function getMostRead(limit = 5): Promise<NewsItem[]> {
  const page = await getNews({ sort: "popular", sinceHours: 24, perSource: 2, limit });
  return page.items;
}

export async function getSummarized(hours?: number): Promise<SummarizedItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");
  return api<SummarizedItem[]>(`/news/summarized?limit=5000${hours ? `&hours=${hours}` : ""}`, { forwardClient: false });
}

export async function getNewsDetail(slug: string): Promise<NewsDetail | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("news", `news:${slug}`);
  try {
    return await api<NewsDetail>(`/news/${encodeURIComponent(slug)}`, { forwardClient: false });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return undefined;
    throw error;
  }
}

export async function getTrending(limit: number, category?: string): Promise<NewsItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");
  const query = new URLSearchParams({ limit: String(limit), ...(category ? { category } : {}) });
  return api<NewsItem[]>(`/news/trending?${query}`, { forwardClient: false });
}

export type HomeFeed = {
  lead: NewsItem | undefined;
  belowLead: NewsItem[];
  side: NewsItem[];
  glance: NewsItem[];
  latest: NewsItem[];
};

const ILLUSTRATED_SLOTS = 7;
const GLANCE_SLOTS = 6;
const LATEST_SLOTS = 8;

export async function getHomeFeed(): Promise<HomeFeed> {
  const [trending, illustrated, latest] = await Promise.all([
    getTrending(30),
    getNews({ withImage: true, perSource: 1, limit: 12 }),
    getNews({ perSource: 1, limit: 30 }),
  ]);
  const pictured = unique([...trending.filter((item) => item.imageUrl), ...illustrated.items]).slice(0, ILLUSTRATED_SLOTS);
  const [lead, ...rest] = pictured;
  const used = new Set(pictured.map((item) => item.id));
  const glance = unique([...trending, ...latest.items]).filter((item) => !used.has(item.id)).slice(0, GLANCE_SLOTS);
  for (const item of glance) used.add(item.id);
  return {
    lead,
    side: rest.slice(0, 2),
    belowLead: rest.slice(2, 6),
    glance,
    latest: latest.items.filter((item) => !used.has(item.id)).slice(0, LATEST_SLOTS),
  };
}

function unique(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => !seen.has(item.id) && Boolean(seen.add(item.id)));
}
