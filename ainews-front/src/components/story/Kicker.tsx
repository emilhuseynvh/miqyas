import { CategoryLabel } from "@/components/ui/CategoryLabel";
import type { Category, NewsItem } from "@/lib/types";

type Props = {
  item: Pick<NewsItem, "breaking">;
  category: Pick<Category, "slug" | "name"> | null;
  className?: string;
};

export function Kicker({ item, category, className = "" }: Props) {
  if (!item.breaking && !category) return null;
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {item.breaking && <BreakingLabel />}
      {category && <CategoryLabel category={category} />}
    </p>
  );
}

export function BreakingLabel() {
  return (
    <span className="inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-signal">
      <span className="size-2 animate-pulse rounded-full bg-signal motion-reduce:animate-none" aria-hidden />
      Son dəqiqə
    </span>
  );
}
