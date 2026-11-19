import type { NewsItem } from "@/lib/types";
import { StoryCard } from "./StoryCard";

type Props = {
  items: NewsItem[];
  showCategory?: boolean;
};

export function NewsGrid({ items, showCategory = true }: Props) {
  return (
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StoryCard key={item.id} item={item} variant="grid" showCategory={showCategory} />
      ))}
    </div>
  );
}
