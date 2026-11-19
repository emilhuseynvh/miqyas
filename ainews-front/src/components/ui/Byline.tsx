import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import type { NewsItem } from "@/lib/types";

export function Byline({ item }: { item: NewsItem }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-sans text-[13px] text-muted">
      <Link href={`/menbe/${item.source.slug}`} className="font-semibold text-ink hover:underline">
        {item.source.name}
      </Link>
      {item.author && <span>{item.author}</span>}
      <time dateTime={item.publishedAt}>{formatDateTime(item.publishedAt)}</time>
    </div>
  );
}
