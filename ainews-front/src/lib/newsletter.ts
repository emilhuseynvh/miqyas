import "server-only";
import { api } from "./api";

export type SubscribeResult = { status: "confirmation_sent" | "already_subscribed" };
export type TokenResult = { status: "ok" | "invalid" };

export const newsletterApi = {
  subscribe: (email: string) => api<SubscribeResult>("/newsletter/subscribe", { method: "POST", body: { email } }),
  confirm: (token: string) => api<TokenResult>("/newsletter/confirm", { method: "POST", body: { token } }),
  unsubscribe: (token: string) => api<TokenResult>("/newsletter/unsubscribe", { method: "POST", body: { token } }),
};
