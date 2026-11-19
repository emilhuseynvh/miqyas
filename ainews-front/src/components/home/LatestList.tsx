import Link from "next/link";
import { TimelineList } from "@/components/story/TimelineList";
import type { NewsItem } from "@/lib/types";

export function LatestList({ items }: { items: NewsItem[] }) {
  return (
    <section aria-labelledby="latest-title">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="latest-title" className="font-sans text-sm font-semibold">
          Son xəbərlər
        </h2>
        <Link href="/son-xeberler" className="font-sans text-xs text-accent hover:underline">
          Hamısı
        </Link>
      </div>
      <div className="mt-3">
        <TimelineList items={items} />
      </div>
    </section>
  );
}
