import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StoryCard } from "@/components/story/StoryCard";
import { PageLinks } from "@/components/ui/PageLinks";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getCategory, getNews } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { categoryDescription } from "@/lib/category-copy";
import { breadcrumbSchema, categoryCrumbs, collectionSchema , pageOpenGraph } from "@/lib/seo";

const PAGE_SIZE = 13;

export async function generateMetadata({ params, searchParams }: PageProps<"/kateqoriya/[slug]">): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) notFound();
  const page = Math.max(1, Number(typeof query.page === "string" ? query.page : 1) || 1);
  const path = page > 1 ? `/kateqoriya/${category.slug}?page=${page}` : `/kateqoriya/${category.slug}`;
  const title = page > 1 ? `${category.name} xəbərləri — səhifə ${page}` : `${category.name} xəbərləri`;
  const description = categoryDescription(category.slug, category.name);
  return {
    title,
    description,
    alternates: {
      canonical: path,
      types: { "application/rss+xml": [{ url: `/kateqoriya/${category.slug}/rss.xml`, title: `${category.name} — RSS` }] },
    },
    openGraph: pageOpenGraph({ title, description, path }),
  };
}

export default function CategoryPage({ params, searchParams }: PageProps<"/kateqoriya/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(typeof query.page === "string" ? query.page : 1) || 1);
  const news = await getNews({ category: category.slug, page, limit: PAGE_SIZE });
  const leadIndex = Math.max(0, news.items.findIndex((item) => item.imageUrl));
  const first = news.items[leadIndex];
  const rest = news.items.filter((_, i) => i !== leadIndex);
  const pageHref = (p: number) => (p > 1 ? `/kateqoriya/${category.slug}?page=${p}` : `/kateqoriya/${category.slug}`);

  return (
    <div className="mt-8">
      <JsonLd
        data={[
          breadcrumbSchema(categoryCrumbs(category)),
          collectionSchema({
            name: `${category.name} xəbərləri`,
            path: `/kateqoriya/${category.slug}`,
            description: categoryDescription(category.slug, category.name),
            items: news.items,
          }),
        ]}
      />
      <Breadcrumbs items={categoryCrumbs(category)} className="mb-4" />
      <header className="border-b-2 border-ink pb-6">
        <h1 className="font-serif text-[44px] font-semibold leading-none tracking-tight md:text-[60px]">{category.name}</h1>
        <p className="mt-4 max-w-[70ch] text-lg leading-snug text-muted">{categoryDescription(category.slug, category.name)}</p>
        <p className="mt-2 font-sans text-sm text-muted">{news.total.toLocaleString("az-AZ")} xəbər, müxtəlif mənbələrdən</p>
      </header>

      {first ? (
        <>
          <div className="mt-8">
            <StoryCard item={first} variant="split" showCategory={false} eager />
          </div>
          {rest.length > 0 && (
            <div className="mt-12 grid gap-x-8 gap-y-10 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-4">
              {rest.map((item) => (
                <StoryCard key={item.id} item={item} variant="grid" showCategory={false} />
              ))}
            </div>
          )}
          <PageLinks page={page} pages={news.pages} href={pageHref} newerLabel="Daha yeni xəbərlər" olderLabel="Daha köhnə xəbərlər" />
        </>
      ) : (
        <p className="mt-10 text-lg text-muted">Bu bölmədə hələ xəbər yoxdur. Digər bölmələrə nəzər yetirin.</p>
      )}
    </div>
  );
}
