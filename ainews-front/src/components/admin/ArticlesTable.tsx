import Link from "next/link";
import type { Article } from "@/lib/admin-api";
import { relativeTime } from "@/lib/relative-time";
import { EmptyRow, Table, Td, Th } from "./ui";

type Props = {
  articles: Article[];
  now: number;
  showSummary?: boolean;
};

export function ArticlesTable({ articles, now, showSummary = true }: Props) {
  return (
    <Table
      head={
        <>
          <Th>Başlıq</Th>
          <Th>Mənbə</Th>
          <Th>Kateqoriya</Th>
          <Th>Dərc</Th>
        </>
      }
    >
      {articles.length === 0 && <EmptyRow colSpan={4}>Xəbər tapılmadı.</EmptyRow>}
      {articles.map((article) => (
        <tr key={article.id}>
          <Td className="min-w-[320px]">
            <div className="flex gap-3">
              {article.imageUrl ? (
                <span
                  className="size-11 shrink-0 rounded bg-ops-bg bg-cover bg-center"
                  style={{ backgroundImage: `url(${JSON.stringify(article.imageUrl)})` }}
                  aria-hidden
                />
              ) : (
                <span className="size-11 shrink-0 rounded bg-ops-bg" aria-hidden />
              )}
              <div className="min-w-0">
                <a href={article.url} target="_blank" rel="noreferrer" className="font-medium leading-snug hover:text-ops-accent">
                  {article.title}
                </a>
                {showSummary && article.summary && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-ops-muted">{article.summary}</p>
                )}
              </div>
            </div>
          </Td>
          <Td className="whitespace-nowrap">
            <Link href={`/admin/xeberler?sourceId=${article.source.id}`} className="hover:text-ops-accent">
              {article.source.name}
            </Link>
          </Td>
          <Td className="whitespace-nowrap text-ops-muted">{article.category?.name ?? "—"}</Td>
          <Td className="whitespace-nowrap text-ops-muted">
            <time dateTime={article.publishedAt ?? article.fetchedAt}>{relativeTime(article.publishedAt ?? article.fetchedAt, now)}</time>
          </Td>
        </tr>
      ))}
    </Table>
  );
}
