import { categoryDescription } from "@/lib/category-copy";
import { getCategory, getNews } from "@/lib/data";
import { renderRss } from "@/lib/rss";
import { site } from "@/lib/site";

export async function GET(_: Request, { params }: RouteContext<"/kateqoriya/[slug]/rss.xml">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return new Response("Not found", { status: 404 });
  const news = await getNews({ category: category.slug, limit: 50 });
  return renderRss({
    title: `${category.name} — ${site.name}`,
    path: `/kateqoriya/${category.slug}`,
    description: categoryDescription(category.slug, category.name),
    items: news.items,
  });
}
