import "server-only";
import { redirect } from "next/navigation";
import { api, ApiError, type User } from "./api";
import { getSessionToken } from "./session";

export type SourceStatus = "pending" | "healthy" | "failing" | "no_feed";

export type Category = { id: number; slug: string; name: string };

export type Source = {
  id: string;
  name: string;
  siteUrl: string;
  feedUrl: string | null;
  kind: string | null;
  language: string;
  isActive: boolean;
  status: SourceStatus;
  defaultCategory: Category | null;
  lastFetchedAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  lastItemCount: number;
  articleCount: number;
};

export type Article = {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  fetchedAt: string;
  source: Pick<Source, "id" | "name" | "siteUrl">;
  category: Category | null;
};

export type Paginated<T> = { items: T[]; total: number; page: number; limit: number; pages: number };

export type IngestionRun = {
  startedAt: string;
  finishedAt: string;
  sources: number;
  succeeded: number;
  failed: number;
  inserted: number;
};

export type Overview = {
  sources: Record<SourceStatus | "inactive" | "total", number>;
  articles: { total: number; last24h: number; lastHour: number };
  users: number;
  subscribers: number;
  ingestion: { running: boolean; lastRun: IngestionRun | null };
};

export type FetchResult = { ok: boolean; found: number; skipped: number; inserted: number; error?: string };

type Query = Record<string, string | number | boolean | undefined>;

const withQuery = (path: string, query: Query = {}) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
};

async function adminRequest<T>(path: string, init: { method?: "GET" | "POST" | "PATCH"; body?: unknown } = {}) {
  const token = await getSessionToken();
  if (!token) redirect("/admin/giris");
  try {
    return await api<T>(path, { ...init, token });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      redirect(`/admin/giris?xeta=${error.status === 403 ? "FORBIDDEN" : "UNAUTHENTICATED"}`);
    }
    throw error;
  }
}

export const adminApi = {
  overview: () => adminRequest<Overview>("/admin/overview"),
  sources: (query: Query) => adminRequest<Paginated<Source>>(withQuery("/admin/sources", query)),
  updateSource: (id: string, body: Partial<Pick<Source, "isActive" | "feedUrl" | "name">>) =>
    adminRequest<Source>(`/admin/sources/${id}`, { method: "PATCH", body }),
  fetchSource: (id: string) => adminRequest<FetchResult>(`/admin/sources/${id}/fetch`, { method: "POST" }),
  runIngestion: () => adminRequest<Overview["ingestion"]>("/admin/ingestion/run", { method: "POST" }),
  articles: (query: Query) => adminRequest<Paginated<Article>>(withQuery("/admin/articles", query)),
  users: () => adminRequest<User[]>("/users"),
};
