import { StoryCard } from "@/components/story/StoryCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Category, NewsItem } from "@/lib/types";

type Props = {
  category: Category;
  items: NewsItem[];
};

export function CategorySection({ category, items }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="mt-14">
      <SectionHeading title={category.name} href={`/kateqoriya/${category.slug}`} />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((item) => (
          <StoryCard key={item.id} item={item} variant="grid" showCategory={false} />
        ))}
      </div>
    </section>
  );
}
