import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { NewsItem } from "@/lib/types";

export function MostRead({ items, title = "Ən çox oxunan" }: { items: NewsItem[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="most-read-title">
      <h2 id="most-read-title" className="border-t-2 border-ink pt-3 font-serif text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <ol className="mt-3 divide-y divide-rule">
        {items.map((item, i) => (
          <li key={item.id} className="grid grid-cols-[28px_1fr] gap-2 py-3">
            <span className="font-serif text-2xl font-semibold leading-none text-muted">{i + 1}</span>
            <div>
              <Link href={`/xeber/${item.slug}`} className="font-serif text-[16px] font-semibold leading-snug hover:underline">
                {item.title}
              </Link>
              <p className="mt-1 flex items-center gap-2 font-sans text-[11px] text-muted">
                <span>{item.source.name}</span>
                <span className="inline-flex items-center gap-1">
                  <Icon name="eye" className="size-3" />
                  {item.viewCount.toLocaleString("az-AZ")}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
