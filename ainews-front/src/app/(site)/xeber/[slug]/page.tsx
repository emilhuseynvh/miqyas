import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleBody } from "@/components/story/ArticleBody";
import { SourceList } from "@/components/story/SourceList";
import { CoverageList } from "@/components/story/CoverageList";
import { EngagementBar } from "@/components/story/EngagementBar";
import { StoryBlock } from "@/components/story/StoryBlock";
import { StoryCard } from "@/components/story/StoryCard";
import { Byline } from "@/components/ui/Byline";
import { CategoryLabel } from "@/components/ui/CategoryLabel";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StoryImage } from "@/components/ui/StoryImage";
import { getNewsDetail } from "@/lib/data";
import { getArticleState } from "@/lib/engagement";
import { getCurrentUser } from "@/lib/session";
import type { NewsArticle } from "@/lib/types";
import Image from "next/image";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  articleCanonical,
  articleHeadline,
  isArticleIndexable,
  breadcrumbSchema,
  categoryCrumbs,
  type Crumb,
  describe,
  newsArticleSchema,
} from "@/lib/seo";

const WORDS_PER_MINUTE = 200;

export async function generateMetadata({ params }: PageProps<"/xeber/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getNewsDetail(slug);
  if (!detail) notFound();

  const { article } = detail;
  const headline = articleHeadline(article);
  const description = describe(article.story?.summary, article.summary, article.content);
  const images = article.imageUrl ? [{ url: article.imageUrl, alt: headline }] : undefined;
  return {
    title: headline,
    description,
    alternates: { canonical: articleCanonical(article) },
    robots: isArticleIndexable(article) ? undefined : { index: false, follow: true },
    openGraph: {
      type: "article",
      title: headline,
      description,
      url: `/xeber/${article.slug}`,
      images,
      publishedTime: article.publishedAt,
      modifiedTime: article.story?.summarizedAt ?? article.publishedAt,
      section: article.category?.name,
      authors: [article.story ? "Miqyas" : (article.author ?? article.source.name)],
    },
    twitter: { card: images ? "summary_large_image" : "summary", title: headline, description, images },
    other: { "article:source": article.source.name },
  };
}

export default function ArticlePage({ params, searchParams }: PageProps<"/xeber/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ArticleContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ArticleContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const fromExploration = query.kesf === "1";
  const detail = await getNewsDetail(slug);
  if (!detail) notFound();

  const { article, related } = detail;
  const [user, state] = await Promise.all([getCurrentUser().catch(() => null), getArticleState(article.id)]);
  const headline = articleHeadline(article);
  const paragraphs = (article.content ?? article.summary ?? "").split(/\n{2,}/).filter(Boolean);
  const words = (article.story ? article.story.summary : paragraphs.join(" ")).split(/\s+/).length;
  const readMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  const crumbs: Crumb[] = [
    ...(article.category ? categoryCrumbs(article.category) : [{ name: "Əsas", path: "/" }]),
    { name: headline, path: `/xeber/${article.slug}` },
  ];

  return (
    <article className="relative mt-8">
      <Image src={`/baxis/${article.id}${fromExploration ? "?kesf=1" : ""}`} alt="" width={1} height={1} unoptimized className="absolute size-px opacity-0" />
      <JsonLd data={[newsArticleSchema(article), breadcrumbSchema(crumbs)]} />
      <header className="mx-auto max-w-[820px] text-center">
        <Breadcrumbs items={crumbs} className="mb-4 flex justify-center" />
        {article.category && <CategoryLabel category={article.category} />}
        <h1 className="mt-3 font-serif text-[34px] font-medium leading-[1.06] tracking-[-0.015em] text-balance md:text-[48px]">
          {headline}
        </h1>
        <div className="mt-6">
          <Byline item={article} />
        </div>
      </header>

      {article.imageUrl && (
        <div className="mx-auto mt-8 max-w-[1000px]">
          <StoryImage src={article.imageUrl} alt={headline} ratio="wide" eager sizes="(min-width: 1040px) 1000px, 100vw" />
        </div>
      )}

      <div className="mx-auto mt-10 max-w-[760px]">
        <div className="flex min-w-0 flex-col gap-10">
          <p className="-mb-6 font-sans text-xs text-muted">{readMinutes} dəq oxu</p>
          <EngagementBar article={article} state={state} signedIn={Boolean(user)} />

          {article.story ? (
            <>
              <StoryBlock title="Qısa xülasə" note="Süni intellekt hazırlayıb">
                <ArticleBody paragraphs={[article.story.summary]} />
                <p className="mt-4 font-sans text-xs text-muted">
                  Xülasə bu hadisəni yazan mənbələrin mətnlərinə əsasən hazırlanıb. Dəqiq ifadələr üçün orijinal mətnlərə baxın.
                </p>
              </StoryBlock>
              <StoryBlock title={`${article.source.name} yazır`}>
                <p className="font-serif text-lg italic">{article.title}</p>
                {article.summary && <p className="mt-3 max-w-[66ch] text-[17px] leading-relaxed text-muted">{article.summary}</p>}
                <OriginalLink article={article} label="Tam oxu" />
              </StoryBlock>
            </>
          ) : (
            <StoryBlock title="Xəbər">
              <ArticleBody paragraphs={paragraphs} />
              {!article.content && (
                <p className="mt-4 font-sans text-sm text-muted">Bu xəbərin tam mətnini mənbədən almaq alınmadı.</p>
              )}
              <OriginalLink article={article} label="Orijinalı" />
            </StoryBlock>
          )}

          {article.coverage.length > 1 ? (
            <StoryBlock title={`Bu xəbəri ${article.sourceCount} mənbə yazıb`} note="Dərc vaxtına görə">
              <CoverageList items={article.coverage} currentId={article.id} />
            </StoryBlock>
          ) : (
            <StoryBlock title="Mənbə" note="1 mənbə">
              <SourceList sources={[{ outlet: article.source.name, title: article.title, url: article.url }]} />
            </StoryBlock>
          )}
        </div>

      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Digər mənbələrdən" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <StoryCard key={item.id} item={item} variant="grid" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function OriginalLink({ article, label }: { article: NewsArticle; label: string }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="mt-6 inline-flex items-center gap-2 border border-ink px-4 py-2 font-sans text-sm font-semibold hover:bg-ink hover:text-paper"
    >
      {label} {article.source.name} saytında
    </a>
  );
}
