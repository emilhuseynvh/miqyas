import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getSources } from "@/lib/data";
import { absoluteUrl, breadcrumbSchema, type Crumb, pageOpenGraph } from "@/lib/seo";

const description =
  "Miqyasın izlədiyi Azərbaycan xəbər saytlarının tam siyahısı: hər mənbənin son xəbərləri ayrıca səhifədə, orijinal sayta keçidlə.";

export const metadata: Metadata = {
  title: "Xəbər mənbələri",
  description,
  alternates: { canonical: "/menbeler" },
  openGraph: pageOpenGraph({ title: "Xəbər mənbələri", description, path: "/menbeler" }),
};

const crumbs: Crumb[] = [
  { name: "Əsas", path: "/" },
  { name: "Mənbələr", path: "/menbeler" },
];

export default async function SourcesIndexPage() {
  const sources = await getSources();
  return (
    <div className="mx-auto max-w-[900px] py-8">
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          {
            "@type": "CollectionPage",
            name: "Xəbər mənbələri",
            url: absoluteUrl("/menbeler"),
            description,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: sources.length,
              itemListElement: sources.map((source, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: absoluteUrl(`/menbe/${source.slug}`),
                name: source.name,
              })),
            },
          },
        ]}
      />
      <Breadcrumbs items={crumbs} className="mb-4" />
      <header className="border-b-2 border-ink pb-6">
        <h1 className="font-serif text-[44px] font-semibold leading-none tracking-tight md:text-[56px]">Xəbər mənbələri</h1>
        <p className="mt-4 max-w-[70ch] text-lg leading-snug text-muted">{description}</p>
        <p className="mt-2 font-sans text-sm text-muted">{sources.length} aktiv mənbə</p>
      </header>
      <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <li key={source.slug} className="flex items-baseline justify-between gap-3 border-b border-rule py-2.5">
            <Link href={`/menbe/${source.slug}`} className="font-serif text-[17px] hover:underline">
              {source.name}
            </Link>
            <span className="shrink-0 font-sans text-xs tabular-nums text-muted">{source.articleCount.toLocaleString("az-AZ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
