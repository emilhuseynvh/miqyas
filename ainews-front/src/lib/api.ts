import "server-only";
import { headers } from "next/headers";

export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
};

export type AuthenticatedResponse = {
  status: "authenticated";
  accessToken: string;
  user: User;
};

export type VerifyLinkResponse =
  | AuthenticatedResponse
  | { status: "registration_required"; email: string };

export type ApiErrorCode =
  | "INVALID_LINK"
  | "EXPIRED_LINK"
  | "LINK_ALREADY_USED"
  | "ACCOUNT_EXISTS"
  | "INVALID_CREDENTIALS"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "UNAVAILABLE";

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status: number,
  ) {
    super(code);
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  forwardClient?: boolean;
};

const baseUrl = process.env.API_URL ?? "http://localhost:4000/api";
const internalToken = process.env.INTERNAL_API_TOKEN;

function toErrorCode(status: number, body: unknown): ApiErrorCode {
  const code = (body as { code?: string } | null)?.code;
  if (code) return code as ApiErrorCode;
  if (status === 400) return "VALIDATION";
  if (status === 401) return "UNAUTHENTICATED";
  if (status === 403) return "FORBIDDEN";
  if (status === 429) return "RATE_LIMITED";
  return "UNAVAILABLE";
}

async function clientIp(): Promise<string | undefined> {
  const store = await headers();
  return store.get("x-forwarded-for")?.split(",")[0]?.trim() || store.get("x-real-ip") || undefined;
}

export async function api<T>(
  path: string,
  { method = "GET", body, token, forwardClient = true }: RequestOptions = {},
): Promise<T> {
  const ip = forwardClient ? await clientIp() : undefined;
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(internalToken ? { "x-internal-token": internalToken } : {}),
        ...(ip ? { "x-client-ip": ip } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("UNAVAILABLE", 503);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(toErrorCode(response.status, data), response.status);
  return data as T;
}

export const authApi = {
  requestLink: (email: string) => api<{ sent: true }>("/auth/magic-link", { method: "POST", body: { email } }),
  verify: (token: string) => api<VerifyLinkResponse>("/auth/verify", { method: "POST", body: { token } }),
  register: (input: { token: string; firstName: string; lastName: string }) =>
    api<AuthenticatedResponse>("/auth/register", { method: "POST", body: input }),
  adminLogin: (email: string, password: string) =>
    api<AuthenticatedResponse>("/auth/admin/login", { method: "POST", body: { email, password } }),
  me: (accessToken: string) => api<User>("/users/me", { token: accessToken }),
};
