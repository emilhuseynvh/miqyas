import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { TimelineList } from "@/components/story/TimelineList";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageLinks } from "@/components/ui/PageLinks";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getNews } from "@/lib/data";
import { breadcrumbSchema, collectionSchema, type Crumb, pageOpenGraph } from "@/lib/seo";

const PAGE_SIZE = 40;
const TITLE = "Son xəbərlər";
const description =
  "Azərbaycanın xəbər saytlarında dərc olunan bütün son xəbərlər vaxt sırası ilə: siyasət, iqtisadiyyat, cəmiyyət, idman və digər bölmələrdən.";

const crumbs: Crumb[] = [
  { name: "Əsas", path: "/" },
  { name: TITLE, path: "/son-xeberler" },
];

const pagePath = (page: number) => (page > 1 ? `/son-xeberler?page=${page}` : "/son-xeberler");

export async function generateMetadata({ searchParams }: PageProps<"/son-xeberler">): Promise<Metadata> {
  const page = pageNumber(await searchParams);
  const title = page > 1 ? `${TITLE} — səhifə ${page}` : TITLE;
  return {
    title,
    description,
    alternates: { canonical: pagePath(page) },
    openGraph: pageOpenGraph({ title, description, path: pagePath(page) }),
  };
}

export default function LatestNewsPage({ searchParams }: PageProps<"/son-xeberler">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LatestContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LatestContent({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const page = pageNumber(await searchParams);
  const news = await getNews({ page, limit: PAGE_SIZE });

  return (
    <div className="mx-auto max-w-[820px] py-8">
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          collectionSchema({ name: TITLE, path: "/son-xeberler", description, items: news.items }),
        ]}
      />
      <Breadcrumbs items={crumbs} className="mb-4" />
      <header className="border-b-2 border-ink pb-6">
        <h1 className="font-serif text-[44px] font-semibold leading-none tracking-tight md:text-[60px]">{TITLE}</h1>
        <p className="mt-4 max-w-[70ch] text-lg leading-snug text-muted">
          Bütün mənbələrdən gələn xəbərlər, ən yenisi yuxarıda. Gündəmdəki hadisələr ana səhifədədir.
        </p>
      </header>
      {news.items.length > 0 ? (
        <div className="mt-2">
          <TimelineList items={news.items} size="md" />
        </div>
      ) : (
        <p className="mt-10 text-lg text-muted">Hələ xəbər yoxdur. Bir neçə dəqiqədən sonra yenidən baxın.</p>
      )}
      <PageLinks page={page} pages={news.pages} href={pagePath} newerLabel="Daha yeni xəbərlər" olderLabel="Daha köhnə xəbərlər" />
    </div>
  );
}

function pageNumber(query: Record<string, string | string[] | undefined>): number {
  return Math.max(1, Number(typeof query.page === "string" ? query.page : 1) || 1);
}
