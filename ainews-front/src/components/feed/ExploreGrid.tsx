import type { FeedItem } from "@/lib/feed";
import { ExploreTile } from "./ExploreTile";

const LARGE_EVERY = 7;

type Props = {
  items: FeedItem[];
  canHide: boolean;
};

export function ExploreGrid({ items, canHide }: Props) {
  return (
    <div className="grid grid-flow-dense grid-cols-2 gap-1.5 md:grid-cols-3 md:gap-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <ExploreTile
          key={item.id}
          item={item}
          large={i % LARGE_EVERY === 0}
          canHide={canHide}
          anchor={`s${i}`}
          eager={i < 4}
        />
      ))}
    </div>
  );
}
