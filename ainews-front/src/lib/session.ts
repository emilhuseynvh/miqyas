import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { ApiError, authApi, type User } from "./api";

const SESSION_COOKIE = "miqyas_session";
const PENDING_EMAIL_COOKIE = "miqyas_pending_email";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await authApi.me(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function startSession(accessToken: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, accessToken, { ...baseCookie, maxAge: SESSION_MAX_AGE });
  store.delete(PENDING_EMAIL_COOKIE);
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function rememberPendingEmail(email: string) {
  const store = await cookies();
  store.set(PENDING_EMAIL_COOKIE, email, { ...baseCookie, maxAge: 60 * 15 });
}

export async function getPendingEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(PENDING_EMAIL_COOKIE)?.value ?? null;
}
