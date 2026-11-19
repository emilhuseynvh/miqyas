import { type NextRequest, NextResponse } from "next/server";
import { ApiError, authApi } from "@/lib/api";
import { startSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (!token) return to("/hesab?xeta=INVALID_LINK");

  try {
    const result = await authApi.verify(token);
    if (result.status === "registration_required") {
      return to(`/hesab/tamamla?token=${encodeURIComponent(token)}`);
    }
    await startSession(result.accessToken);
    return to("/");
  } catch (error) {
    const code = error instanceof ApiError ? error.code : "UNAVAILABLE";
    return to(`/hesab?xeta=${code}`);
  }
}
