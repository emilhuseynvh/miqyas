import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import type { NewsItem } from "@/lib/types";

export function SourceMeta({ item, className = "" }: { item: NewsItem; className?: string }) {
  return (
    <p className={`font-sans text-xs text-muted ${className}`}>
      <Link href={`/menbe/${item.source.slug}`} className="relative font-medium text-ink/80 hover:underline">
        {item.source.name}
      </Link>
      {item.sourceCount > 1 && (
        <span className="ml-1.5 rounded-sm bg-band/70 px-1 py-px font-semibold text-ink">+{item.sourceCount - 1} mənbə</span>
      )}
      <time dateTime={item.publishedAt} className="ml-2">
        {formatDateTime(item.publishedAt)}
      </time>
    </p>
  );
}
