import Link from "next/link";
import type { NewsItem } from "@/lib/types";
import { BreakingLabel } from "./Kicker";

type Props = {
  items: NewsItem[];
  updatedLabel: string;
};

export function GlanceList({ items, updatedLabel }: Props) {
  return (
    <section aria-labelledby="glance-title">
      <h2 id="glance-title" className="font-serif text-[26px] font-semibold leading-none tracking-tight">
        Gündəmdə
      </h2>
      <p className="mt-2 flex items-center gap-2 font-sans text-xs text-muted">
        <span className="size-2 rounded-full bg-signal" aria-hidden />
        {updatedLabel}
      </p>
      <ol className="mt-5 space-y-4">
        {items.map((item, i) => (
          <li key={item.id} className="grid grid-cols-[18px_1fr] gap-1 text-[16px] leading-snug">
            <span className="font-sans text-sm font-semibold">{i + 1}</span>
            <p>
              {item.breaking && (
                <span className="mb-0.5 block">
                  <BreakingLabel />
                </span>
              )}
              <Link href={`/xeber/${item.slug}`} className="font-semibold underline decoration-1 underline-offset-[3px] hover:decoration-2">
                {item.title}
              </Link>
              <span className="mt-1 block font-sans text-xs text-muted">
                {item.source.name}
                {item.sourceCount > 1 && ` və daha ${item.sourceCount - 1} mənbə`}
              </span>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
