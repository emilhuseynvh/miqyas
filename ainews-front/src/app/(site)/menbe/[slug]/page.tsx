import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NewsGrid } from "@/components/story/NewsGrid";
import { Icon } from "@/components/ui/Icon";
import { PageLinks } from "@/components/ui/PageLinks";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getNews, getSource } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { breadcrumbSchema, collectionSchema, sourceCrumbs , pageOpenGraph } from "@/lib/seo";

export async function generateMetadata({ params, searchParams }: PageProps<"/menbe/[slug]">): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const source = await getSource(slug);
  if (!source) notFound();
  const page = Math.max(1, Number(typeof query.page === "string" ? query.page : 1) || 1);
  const path = page > 1 ? `/menbe/${source.slug}?page=${page}` : `/menbe/${source.slug}`;
  const title = page > 1 ? `${source.name} xəbərləri — səhifə ${page}` : `${source.name} xəbərləri`;
  const description = `${source.name} saytının son xəbərləri bir yerdə: başlıqlar, qısa mətn və orijinal mənbəyə keçid.`;
  return { title, description, alternates: { canonical: path }, openGraph: pageOpenGraph({ title, description, path }) };
}

export default function SourcePage({ params, searchParams }: PageProps<"/menbe/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SourceContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function SourceContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const source = await getSource(slug);
  if (!source) notFound();

  const page = Math.max(1, Number(typeof query.page === "string" ? query.page : 1) || 1);
  const news = await getNews({ source: source.slug, page, limit: 24 });

  return (
    <div className="mt-8">
      <JsonLd
        data={[
          breadcrumbSchema(sourceCrumbs(source)),
          collectionSchema({
            name: `${source.name} xəbərləri`,
            path: `/menbe/${source.slug}`,
            description: `${source.name} saytının son xəbərləri`,
            items: news.items,
          }),
        ]}
      />
      <Breadcrumbs items={sourceCrumbs(source)} className="mb-4" />
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-6">
        <div>
          <p className="font-sans text-sm text-muted">Mənbə</p>
          <h1 className="font-serif text-[44px] font-semibold leading-none tracking-tight md:text-[56px]">{source.name}</h1>
          <p className="mt-3 font-sans text-sm text-muted">{news.total.toLocaleString("az-AZ")} xəbər</p>
        </div>
        <a href={source.siteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-sans text-sm text-accent hover:underline">
          {source.siteUrl.replace(/^https?:\/\//, "")}
          <Icon name="external" className="size-3.5" />
        </a>
      </header>
      {news.items.length === 0 ? (
        <p className="mt-10 text-lg text-muted">Bu mənbədən hələ xəbər yoxdur.</p>
      ) : (
        <div className="mt-8">
          <NewsGrid items={news.items} />
        </div>
      )}
      <PageLinks page={news.page} pages={news.pages} href={(p) => `/menbe/${source.slug}?page=${p}`} newerLabel="Daha yeni" olderLabel="Daha köhnə" />
    </div>
  );
}
