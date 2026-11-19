import Link from "next/link";
import { formatTime } from "@/lib/format";
import type { NewsItem } from "@/lib/types";

export function LatestList({ items }: { items: NewsItem[] }) {
  return (
    <section aria-labelledby="latest-title">
      <h2 id="latest-title" className="font-sans text-sm font-semibold">
        Son xəbərlər
      </h2>
      <ul className="mt-3 divide-y divide-rule">
        {items.map((item) => (
          <li key={item.id} className="grid grid-cols-[44px_1fr] gap-2 py-2.5">
            <time dateTime={item.publishedAt} className="pt-0.5 font-sans text-xs text-muted">
              {formatTime(item.publishedAt)}
            </time>
            <div>
              <Link href={`/xeber/${item.slug}`} className="text-[15px] leading-snug hover:underline">
                {item.title}
              </Link>
              <p className="mt-0.5 font-sans text-[11px] text-muted">{item.source.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
