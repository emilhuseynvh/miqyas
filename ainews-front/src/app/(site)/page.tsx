import { AdSlot } from "@/components/ads/AdSlot";
import { Fragment, Suspense } from "react";
import { ForYouStrip } from "@/components/feed/ForYouStrip";
import { CategorySection } from "@/components/home/CategorySection";
import { LatestList } from "@/components/home/LatestList";
import { MostRead } from "@/components/home/MostRead";
import { NewsletterBlock } from "@/components/home/NewsletterBlock";
import { GlanceList } from "@/components/story/GlanceList";
import { StoryCard } from "@/components/story/StoryCard";
import { getCategories, getHomeFeed, getMostRead, getNews } from "@/lib/data";
import { formatTime } from "@/lib/format";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import { collectionSchema, organizationSchema, pageOpenGraph, websiteSchema } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} — son xəbərlər` }] },
  },
  openGraph: pageOpenGraph({ title: site.homeTitle, description: site.description, path: "/" }),
};

const featuredSections = ["siyaset", "dunya", "iqtisadiyyat", "cemiyyet", "idman"];

export default async function HomePage() {
  const [feed, categories, mostRead] = await Promise.all([getHomeFeed(), getCategories(), getMostRead(5)]);
  const sections = await Promise.all(
    categories
      .filter((c) => featuredSections.includes(c.slug))
      .map(async (category) => ({
        category,
        items: (await getNews({ category: category.slug, withImage: true, perSource: 1, limit: 4 })).items,
      })),
  );
  const newest = [feed.lead, ...feed.side, ...feed.glance]
    .filter((item) => item !== undefined)
    .map((item) => item.publishedAt)
    .sort()
    .at(-1);

  if (!feed.lead) {
    return <p className="mt-16 text-center text-lg text-muted">Hələ xəbər toplanmayıb. Bir neçə dəqiqədən sonra yenidən baxın.</p>;
  }

  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          websiteSchema(),
          collectionSchema({
            name: `${site.name} — son xəbərlər`,
            path: "/",
            description: site.description,
            items: [feed.lead, ...feed.side, ...feed.glance],
          }),
        ]}
      />
      <h1 className="sr-only">{`${site.name} — Azərbaycanın xəbər saytlarından son xəbərlər bir yerdə`}</h1>
      <div className="mt-6 grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)_290px] lg:gap-0">
        <aside className="order-2 lg:order-1 lg:pr-7">
          <GlanceList items={feed.glance} updatedLabel={newest ? `Yenilənib ${formatTime(newest)}` : "Bu gün"} />
          <div className="mt-10">
            <LatestList items={feed.latest} />
          </div>
        </aside>

        <div className="order-1 lg:order-2 lg:border-x lg:border-dotted lg:border-rule lg:px-8">
          <h2 className="sr-only">Günün əsas xəbərləri</h2>
          <StoryCard item={feed.lead} variant="lead" eager />
          {feed.belowLead.length > 0 && (
            <div className="mt-10 grid gap-x-8 gap-y-6 border-t border-rule pt-6 sm:grid-cols-2">
              {feed.belowLead.map((item) => (
                <StoryCard key={item.id} item={item} variant="compact" />
              ))}
            </div>
          )}
        </div>

        <aside className="order-3 flex flex-col gap-8 lg:pl-7">
          {feed.side.map((item, i) => (
            <div key={item.id} className={i > 0 ? "border-t border-rule pt-6" : ""}>
              <StoryCard item={item} variant="feature" />
            </div>
          ))}
          <MostRead items={mostRead} />
          <AdSlot variant="box" />
        </aside>
      </div>

      <AdSlot className="mt-14" />

      <Suspense fallback={null}>
        <ForYouStrip />
      </Suspense>

      {sections.map(({ category, items }, i) => (
        <Fragment key={category.slug}>
          <CategorySection category={category} items={items} />
          {i === 1 && <AdSlot className="mt-14" />}
        </Fragment>
      ))}

      <NewsletterBlock />
    </>
  );
}
