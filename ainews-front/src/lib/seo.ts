import { site } from "./site";
import type { Category, NewsArticle, NewsItem, NewsSource } from "./types";

export const ARTICLE_INDEXING: "source" | "self" = process.env.ARTICLE_INDEXING === "self" ? "self" : "source";

export const NEWS_SITEMAP_HOURS = 48;
const DESCRIPTION_LIMIT = 158;

export const absoluteUrl = (path: string) => new URL(path, site.url).toString();

export function describe(...candidates: (string | null | undefined)[]): string {
  const text = candidates.find((value) => value && value.trim().length > 40)?.replace(/\s+/g, " ").trim() ?? site.description;
  if (text.length <= DESCRIPTION_LIMIT) return text;
  const cut = text.slice(0, DESCRIPTION_LIMIT);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export const articleIndexable = ARTICLE_INDEXING === "self";

export function articleCanonical(article: Pick<NewsItem, "slug">): string {
  return absoluteUrl(`/xeber/${article.slug}`);
}

export function pageOpenGraph(input: { title: string; description: string; path: string; type?: "website" | "article" }) {
  return {
    type: input.type ?? "website",
    siteName: site.name,
    locale: "az_AZ",
    title: input.title,
    description: input.description,
    url: input.path,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }],
  };
}

export const organizationId = absoluteUrl("/#organization");
export const websiteId = absoluteUrl("/#website");

export function organizationSchema() {
  return {
    "@type": "NewsMediaOrganization",
    "@id": organizationId,
    name: site.name,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png"), width: 512, height: 512 },
    description: site.description,
    publishingPrinciples: absoluteUrl("/menbe-siyaseti"),
    actionableFeedbackPolicy: absoluteUrl("/elaqe"),
    ethicsPolicy: absoluteUrl("/menbe-siyaseti"),
    diversityPolicy: absoluteUrl("/haqqimizda"),
    email: site.contactEmail,
    contactPoint: { "@type": "ContactPoint", contactType: "editorial", email: site.contactEmail, url: absoluteUrl("/elaqe") },
    sameAs: site.socialLinks.length > 0 ? site.socialLinks : undefined,
    areaServed: { "@type": "Country", name: "Azərbaycan" },
    knowsLanguage: "az",
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    name: site.name,
    url: absoluteUrl("/"),
    inLanguage: "az",
    publisher: { "@id": organizationId },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/axtaris?q={search_term_string}") },
      "query-input": "required name=search_term_string",
    },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function newsArticleSchema(article: NewsArticle) {
  const pageUrl = absoluteUrl(`/xeber/${article.slug}`);
  return {
    "@type": "NewsArticle",
    "@id": `${pageUrl}#article`,
    headline: article.title.slice(0, 110),
    description: describe(article.summary, article.content),
    url: pageUrl,
    mainEntityOfPage: articleCanonical(article),
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: "az",
    image: article.imageUrl ? [article.imageUrl] : undefined,
    articleSection: article.category?.name,
    author: article.author
      ? { "@type": "Person", name: article.author }
      : { "@type": "Organization", name: article.source.name, url: article.source.siteUrl },
    sourceOrganization: { "@type": "NewsMediaOrganization", name: article.source.name, url: article.source.siteUrl },
    isBasedOn: article.url,
    publisher: { "@id": organizationId },
    isAccessibleForFree: true,
  };
}

export function collectionSchema(input: { name: string; path: string; description: string; items: NewsItem[] }) {
  return {
    "@type": "CollectionPage",
    name: input.name,
    url: absoluteUrl(input.path),
    description: input.description,
    inLanguage: "az",
    isPartOf: { "@id": websiteId },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/xeber/${item.slug}`),
        name: item.title,
      })),
    },
  };
}

export const categoryCrumbs = (category: Pick<Category, "slug" | "name">): Crumb[] => [
  { name: "Əsas", path: "/" },
  { name: category.name, path: `/kateqoriya/${category.slug}` },
];

export const sourceCrumbs = (source: Pick<NewsSource, "slug" | "name">): Crumb[] => [
  { name: "Əsas", path: "/" },
  { name: "Mənbələr", path: "/menbeler" },
  { name: source.name, path: `/menbe/${source.slug}` },
];

export type Faq = { question: string; answer: string };

export function faqSchema(faqs: Faq[], path: string) {
  return {
    "@type": "FAQPage",
    url: absoluteUrl(path),
    inLanguage: "az",
    isPartOf: { "@id": websiteId },
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
