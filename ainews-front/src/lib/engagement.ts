import "server-only";
import { api, ApiError } from "./api";
import { getSessionToken } from "./session";
import type { ArticleUserState, Paginated, ReactionValue, TimestampedNewsItem } from "./types";

const emptyState: ArticleUserState = { reaction: 0, saved: false };

export async function recordView(articleId: string, exploration = false): Promise<void> {
  const token = await getSessionToken();
  await api(`/news/${articleId}/view`, {
    method: "POST",
    token: token ?? undefined,
    body: { exploration },
  }).catch(() => undefined);
}

export async function getArticleState(articleId: string): Promise<ArticleUserState> {
  const token = await getSessionToken();
  if (!token) return emptyState;
  return api<ArticleUserState>(`/me/articles/${articleId}/state`, { token }).catch(() => emptyState);
}

async function authed<T>(path: string, method: "GET" | "PUT" | "DELETE" = "GET", body?: unknown): Promise<T> {
  const token = await getSessionToken();
  if (!token) throw new ApiError("UNAUTHENTICATED", 401);
  return api<T>(path, { method, token, body });
}

export const engagementApi = {
  react: (articleId: string, value: ReactionValue) => authed(`/news/${articleId}/reaction`, "PUT", { value }),
  save: (articleId: string) => authed(`/me/saved/${articleId}`, "PUT"),
  unsave: (articleId: string) => authed(`/me/saved/${articleId}`, "DELETE"),
  saved: (page: number) => authed<Paginated<TimestampedNewsItem>>(`/me/saved?page=${page}&limit=20`),
  history: (page: number) => authed<Paginated<TimestampedNewsItem>>(`/me/history?page=${page}&limit=20`),
  clearHistory: () => authed("/me/history", "DELETE"),
};
