import { site } from "@/lib/site";

const GOOGLE_CERTIFICATION_ID = "f08c47fec0942fa0";

export function GET() {
  if (!site.adsenseClient) return new Response("Not found", { status: 404 });
  const publisherId = site.adsenseClient.replace(/^ca-/, "");
  return new Response(`google.com, ${publisherId}, DIRECT, ${GOOGLE_CERTIFICATION_ID}\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
