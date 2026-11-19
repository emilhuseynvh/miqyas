import { recordView } from "@/lib/engagement";

const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request, { params }: RouteContext<"/baxis/[id]">) {
  const { id } = await params;
  const exploration = new URL(request.url).searchParams.get("kesf") === "1";
  if (UUID.test(id)) await recordView(id, exploration);
  return new Response(PIXEL, {
    headers: {
      "content-type": "image/gif",
      "cache-control": "no-store, max-age=0",
    },
  });
}
