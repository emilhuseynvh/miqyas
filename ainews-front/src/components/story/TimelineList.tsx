import Link from "next/link";
import { formatTime } from "@/lib/format";
import type { NewsItem } from "@/lib/types";
import { BreakingLabel } from "./Kicker";

type Props = {
  items: NewsItem[];
  size?: "sm" | "md";
};

const styles = {
  sm: { row: "grid-cols-[44px_1fr] gap-2 py-2.5", title: "text-[15px]", meta: "text-[11px]" },
  md: { row: "grid-cols-[56px_1fr] gap-3 py-4", title: "font-serif text-[19px] font-semibold", meta: "text-xs" },
};

export function TimelineList({ items, size = "sm" }: Props) {
  const style = styles[size];
  return (
    <ul className="divide-y divide-rule">
      {items.map((item) => (
        <li key={item.id} className={`grid ${style.row}`}>
          <time dateTime={item.publishedAt} className="pt-0.5 font-sans text-xs text-muted">
            {formatTime(item.publishedAt)}
          </time>
          <div>
            {item.breaking && <BreakingLabel />}
            <Link href={`/xeber/${item.slug}`} className={`block leading-snug hover:underline ${style.title}`}>
              {item.title}
            </Link>
            <p className={`mt-0.5 font-sans text-muted ${style.meta}`}>
              {item.source.name}
              {item.sourceCount > 1 && ` · +${item.sourceCount - 1} mənbə`}
              {size === "md" && item.category && ` · ${item.category.name}`}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
