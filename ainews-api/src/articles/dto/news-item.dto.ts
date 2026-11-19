import type { Article } from '../entities/article.entity.js';

export class NewsItemDto {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  url: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  sourceCount: number;
  source: { id: string; name: string; slug: string; siteUrl: string };
  category: { slug: string; name: string } | null;

  static from(article: Article): NewsItemDto {
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      url: article.url,
      imageUrl: article.imageUrl,
      author: article.author,
      publishedAt: article.publishedAt,
      viewCount: article.viewCount,
      likeCount: article.likeCount,
      dislikeCount: article.dislikeCount,
      sourceCount: article.story?.sourceCount ?? 1,
      source: {
        id: article.source.id,
        name: article.source.name,
        slug: article.source.slug,
        siteUrl: article.source.siteUrl,
      },
      category: article.category
        ? { slug: article.category.slug, name: article.category.name }
        : null,
    };
  }
}

export type CoverageItem = {
  id: string;
  slug: string;
  title: string;
  url: string;
  publishedAt: Date;
  source: { name: string; slug: string };
};

export class NewsDetailDto extends NewsItemDto {
  content: string | null;
  coverage: CoverageItem[];

  static fromDetail(article: Article, coverage: Article[]): NewsDetailDto {
    return {
      ...NewsItemDto.from(article),
      content: article.content,
      coverage: coverage.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        url: item.url,
        publishedAt: item.publishedAt,
        source: { name: item.source.name, slug: item.source.slug },
      })),
    };
  }
}
