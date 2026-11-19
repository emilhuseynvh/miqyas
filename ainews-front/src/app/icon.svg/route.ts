import { markSvg } from "@/lib/brand";

export function GET() {
  return new Response(markSvg(), {
    headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" },
  });
}
