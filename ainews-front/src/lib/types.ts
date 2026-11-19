export type Category = {
  id: number;
  slug: string;
  name: string;
  sortOrder: number;
};

export type NewsSource = {
  id: string;
  name: string;
  slug: string;
  siteUrl: string;
};

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  url: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  sourceCount: number;
  source: NewsSource;
  category: Pick<Category, "slug" | "name"> | null;
};

export type NewsPage = {
  items: NewsItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type TimestampedNewsItem = NewsItem & { at: string };

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type ReactionValue = -1 | 0 | 1;

export type ArticleUserState = {
  reaction: ReactionValue;
  saved: boolean;
};

export type CoverageItem = {
  id: string;
  slug: string;
  title: string;
  url: string;
  publishedAt: string;
  source: Pick<NewsSource, "name" | "slug">;
};

export type NewsArticle = NewsItem & {
  content: string | null;
  coverage: CoverageItem[];
};

export type NewsDetail = {
  article: NewsArticle;
  related: NewsItem[];
};

export type Tone = "dəstəkləyici" | "neytral" | "tənqidi";

export type Perspective = {
  outlet: string;
  country: string;
  framing: string;
  excerpt: string;
  tone: Tone;
};

export type TimelineEntry = {
  date: string;
  text: string;
};

export type SourceLink = {
  outlet: string;
  title: string;
  url: string;
};
