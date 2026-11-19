import { type NextRequest, NextResponse } from "next/server";
import { newsletterApi } from "@/lib/newsletter";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  let status = "etibarsiz";
  if (UUID.test(token)) {
    const result = await newsletterApi.confirm(token).catch(() => null);
    status = result?.status === "ok" ? "tesdiqlendi" : result ? "etibarsiz" : "xeta";
  }
  return NextResponse.redirect(new URL(`/icmal?abune=${status}#abune`, request.url));
}
