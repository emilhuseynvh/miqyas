import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeed } from "@/lib/feed";
import { ExploreTile } from "./ExploreTile";

const STRIP_SIZE = 4;

export async function ForYouStrip() {
  const feed = await getFeed(STRIP_SIZE).catch(() => null);
  if (!feed || feed.items.length === 0) return null;

  return (
    <section className="mt-14">
      <SectionHeading title="Sizin üçün" href="/sizin-ucun" linkLabel="Hamısına bax" />
      <div className="grid grid-cols-2 gap-1.5 md:gap-2 lg:grid-cols-4">
        {feed.items.map((item) => (
          <ExploreTile key={item.id} item={item} canHide={false} />
        ))}
      </div>
    </section>
  );
}
