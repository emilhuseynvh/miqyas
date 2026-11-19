import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExploreGrid } from "@/components/feed/ExploreGrid";
import { InterestPicker } from "@/components/feed/InterestPicker";
import { LinkButton } from "@/components/ui/Button";
import { getCategories } from "@/lib/data";
import { getFeed } from "@/lib/feed";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sizin üçün", robots: { index: false, follow: false } };

const PAGE_SIZE = 20;
const MAX_PAGES = 5;

export default function ForYouPage({ searchParams }: PageProps<"/sizin-ucun">) {
  return (
    <div className="py-8">
      <header className="mb-6 border-b-2 border-ink pb-5">
        <h1 className="font-serif text-[40px] font-semibold leading-none tracking-tight md:text-[56px]">Sizin üçün</h1>
      </header>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FeedContent({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const pages = Math.min(MAX_PAGES, Math.max(1, Number(typeof params.sehife === "string" ? params.sehife : 1) || 1));
  const [user, feed] = await Promise.all([getCurrentUser().catch(() => null), getFeed(PAGE_SIZE * pages)]);
  const categories = feed.needsOnboarding ? await getCategories() : [];

  return (
    <>
      <p className="-mt-2 mb-6 max-w-[70ch] font-sans text-sm text-muted">
        {feed.personalized
          ? "Oxuduğun, bəyəndiyin və saxladığın xəbərlərə görə seçilib. Kartın küncündəki ✕ ilə istəmədiyin mövzunu azalda bilərsən."
          : user
            ? "Hələlik təzə və populyar xəbərlər göstərilir. Oxuduqca lent sənə uyğunlaşacaq."
            : "Təzə və populyar xəbərlər."}
        {!user && (
          <>
            {" "}
            <Link href="/hesab" className="text-accent underline underline-offset-2">
              Daxil ol
            </Link>
            , lent maraqlarına uyğunlaşsın.
          </>
        )}
      </p>

      {feed.needsOnboarding && <InterestPicker categories={categories} />}

      {feed.items.length === 0 ? (
        <p className="py-16 text-center text-lg text-muted">Hələlik göstəriləcək yeni xəbər yoxdur. Bir az sonra yenidən bax.</p>
      ) : (
        <ExploreGrid items={feed.items} canHide={Boolean(user)} />
      )}

      {feed.hasMore && pages < MAX_PAGES && (
        <div className="mt-8 text-center">
          <LinkButton href={`/sizin-ucun?sehife=${pages + 1}#s${pages * PAGE_SIZE}`} variant="outline">
            Daha çox göstər
          </LinkButton>
        </div>
      )}
    </>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-2 gap-1.5 md:grid-cols-3 md:gap-2 lg:grid-cols-4 motion-reduce:animate-none" aria-busy="true" aria-label="Yüklənir">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className={`aspect-square bg-paper-deep ${i === 0 ? "col-span-2 row-span-2" : ""}`} />
      ))}
    </div>
  );
}
