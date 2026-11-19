import { getNews } from "@/lib/data";
import { renderRss } from "@/lib/rss";
import { site } from "@/lib/site";

export async function GET() {
  const news = await getNews({ limit: 50 });
  return renderRss({ title: `${site.name} — son xəbərlər`, path: "/", description: site.description, items: news.items });
}
