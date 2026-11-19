import Link from "next/link";
import type { ReactNode } from "react";
import { StoryImage } from "@/components/ui/StoryImage";
import type { NewsItem } from "@/lib/types";
import { SourceMeta } from "./SourceMeta";

type Props = {
  item: NewsItem;
  note?: string;
  action?: ReactNode;
};

export function NewsRow({ item, note, action }: Props) {
  return (
    <article className="grid grid-cols-[88px_1fr] gap-4 py-4 sm:grid-cols-[120px_1fr_auto]">
      <Link href={`/xeber/${item.slug}`} tabIndex={-1} aria-hidden>
        <StoryImage src={item.imageUrl} alt="" fallbackLabel={item.source.name} ratio="classic" sizes="120px" />
      </Link>
      <div className="min-w-0">
        {item.category && <p className="font-sans text-xs font-semibold text-accent">{item.category.name}</p>}
        <h3 className="font-serif text-lg font-semibold leading-snug">
          <Link href={`/xeber/${item.slug}`} className="hover:underline">
            {item.title}
          </Link>
        </h3>
        <SourceMeta item={item} className="mt-1" />
        {note && <p className="mt-1 font-sans text-xs text-muted">{note}</p>}
      </div>
      {action && <div className="col-span-2 sm:col-span-1 sm:self-center">{action}</div>}
    </article>
  );
}
