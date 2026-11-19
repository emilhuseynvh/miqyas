import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime } from "@/lib/format";
import type { CoverageItem } from "@/lib/types";

type Props = {
  items: CoverageItem[];
  currentId: string;
};

export function CoverageList({ items, currentId }: Props) {
  return (
    <ol className="divide-y divide-rule border-y border-rule">
      {items.map((item) => (
        <li key={item.id} className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3">
          <div className="min-w-0">
            <p className="font-sans text-xs text-muted">
              <Link href={`/menbe/${item.source.slug}`} className="font-semibold text-ink hover:underline">
                {item.source.name}
              </Link>
              <time dateTime={item.publishedAt} className="ml-2">
                {formatDateTime(item.publishedAt)}
              </time>
              {item.id === currentId && <span className="ml-2 font-semibold text-accent">oxuduğunuz</span>}
            </p>
            {item.id === currentId ? (
              <p className="text-[16px] leading-snug">{item.title}</p>
            ) : (
              <Link href={`/xeber/${item.slug}`} className="text-[16px] leading-snug hover:underline">
                {item.title}
              </Link>
            )}
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 font-sans text-xs text-accent hover:underline"
            aria-label={`${item.source.name} saytında aç`}
          >
            Orijinal
            <Icon name="external" className="size-3" />
          </a>
        </li>
      ))}
    </ol>
  );
}
