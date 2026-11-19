import "server-only";
import { api } from "./api";
import { getSessionToken } from "./session";
import type { NewsItem } from "./types";

export type FeedItem = NewsItem & { reason: string; exploration: boolean };

export type Feed = {
  items: FeedItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  personalized: boolean;
  needsOnboarding: boolean;
};

export async function getFeed(limit: number): Promise<Feed> {
  const token = await getSessionToken();
  return api<Feed>(`/feed?page=1&limit=${limit}`, { token: token ?? undefined });
}

async function withToken<T>(path: string, method: "PUT", body?: unknown): Promise<T> {
  const token = await getSessionToken();
  if (!token) throw new Error("Not signed in");
  return api<T>(path, { method, token, body });
}

export const feedApi = {
  hide: (articleId: string) => withToken(`/me/hidden/${articleId}`, "PUT"),
  setInterests: (categories: string[]) => withToken<{ categories: string[] }>("/me/interests", "PUT", { categories }),
};
