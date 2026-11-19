import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsRow } from "@/components/story/NewsRow";
import { Icon } from "@/components/ui/Icon";
import { PageLinks } from "@/components/ui/PageLinks";
import { getNews } from "@/lib/data";

export const metadata: Metadata = { title: "Axtarış", robots: { index: false, follow: false } };

type Params = Record<string, string | string[] | undefined>;

export default function SearchPage({ searchParams }: PageProps<"/axtaris">) {
  return (
    <section className="mx-auto max-w-[820px] py-10">
      <h1 className="text-center font-serif text-[34px] font-semibold tracking-tight">Axtarış</h1>
      <Suspense fallback={<SearchForm />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

function SearchForm({ q }: { q?: string }) {
  return (
    <form action="/axtaris" role="search" className="mt-6 flex">
      <label htmlFor="search-q" className="sr-only">
        Xəbərlərdə axtar
      </label>
      <input
        id="search-q"
        name="q"
        type="search"
        defaultValue={q}
        minLength={2}
        required
        placeholder="Məsələn: Mərkəzi Bank, Qarabağ, neft qiyməti"
        className="w-full min-w-0 border border-ink bg-card px-3 py-2 font-serif text-lg placeholder:text-muted/70 focus:bg-paper focus:outline-none"
      />
      <button type="submit" className="flex shrink-0 items-center gap-2 border border-l-0 border-ink bg-card px-4 font-serif text-lg font-semibold hover:bg-ink hover:text-paper">
        <Icon name="search" />
        Axtar
      </button>
    </form>
  );
}

async function Results({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(typeof params.page === "string" ? params.page : 1) || 1);

  if (q.length < 2) {
    return (
      <>
        <SearchForm q={q} />
        <p className="mt-8 text-center text-muted">Ən azı 2 hərf yazın. Başlıqda və qısa mətndə axtarılır.</p>
      </>
    );
  }

  const results = await getNews({ q, page, limit: 20 });
  return (
    <>
      <SearchForm q={q} />
      <p className="mt-6 font-sans text-sm text-muted">
        &quot;{q}&quot; üzrə {results.total.toLocaleString("az-AZ")} nəticə
      </p>
      {results.items.length === 0 ? (
        <p className="py-10 text-center text-lg text-muted">Heç nə tapılmadı. Başqa söz və ya daha qısa ifadə yoxlayın.</p>
      ) : (
        <div className="divide-y divide-rule">
          {results.items.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
        </div>
      )}
      <PageLinks
        page={results.page}
        pages={results.pages}
        href={(p) => `/axtaris?q=${encodeURIComponent(q)}&page=${p}`}
      />
    </>
  );
}
