import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import { connection } from "next/server";
import { Suspense } from "react";
import { MostRead } from "@/components/home/MostRead";
import { NewsletterBlock } from "@/components/home/NewsletterBlock";
import { SubscribeNotice } from "@/components/home/SubscribeNotice";
import { NewsRow } from "@/components/story/NewsRow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getCategories, getMostRead, getNews } from "@/lib/data";
import { formatLongDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Gündəlik icmal",
  description: "Son 24 saatın ən çox oxunan xəbərləri və hər bölmədən əsas başlıqlar — Azərbaycan mediasından gündəlik xülasə.",
  alternates: { canonical: "/icmal" },
  openGraph: pageOpenGraph({ title: "Gündəlik icmal", description: "Son 24 saatın ən çox oxunan xəbərləri və hər bölmədən əsas başlıqlar — Azərbaycan mediasından gündəlik xülasə.", path: "/icmal" }),
};

const DIGEST_SECTIONS = ["siyaset", "dunya", "iqtisadiyyat", "cemiyyet", "hadise", "idman"];

export default function DigestPage({ searchParams }: PageProps<"/icmal">) {
  return (
    <div className="mx-auto max-w-[900px] py-10">
      <header className="text-center">
        <h1 className="font-serif text-[40px] font-semibold leading-none tracking-tight md:text-[52px]">Gündəlik icmal</h1>
        <Suspense fallback={<p className="mt-3 h-6" />}>
          <Today />
        </Suspense>
        <p className="mx-auto mt-3 max-w-[56ch] text-lg text-muted">
          Son 24 saatda ən çox oxunan xəbərlər və hər bölmədən əsas başlıqlar, bir səhifədə.
        </p>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <Digest />
      </Suspense>
      <Suspense fallback={null}>
        <Notice searchParams={searchParams} />
      </Suspense>
      <NewsletterBlock />
    </div>
  );
}

async function Notice({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { abune } = await searchParams;
  return <SubscribeNotice status={typeof abune === "string" ? abune : undefined} />;
}

async function Today() {
  await connection();
  return <p className="mt-3 font-sans text-sm text-muted">{formatLongDate(new Date())}</p>;
}

async function Digest() {
  const [mostRead, categories] = await Promise.all([getMostRead(8), getCategories()]);
  const sections = await Promise.all(
    categories
      .filter((c) => DIGEST_SECTIONS.includes(c.slug))
      .map(async (category) => ({
        category,
        items: (await getNews({ category: category.slug, sinceHours: 24, perSource: 1, limit: 3 })).items,
      })),
  );

  return (
    <div className="mt-10 grid gap-12">
      <MostRead items={mostRead} title="Günün ən çox oxunanları" />
      {sections
        .filter((section) => section.items.length > 0)
        .map(({ category, items }) => (
          <section key={category.slug}>
            <SectionHeading title={category.name} href={`/kateqoriya/${category.slug}`} as="h2" />
            <div className="divide-y divide-rule">
              {items.map((item) => (
                <NewsRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
