import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { removeSaved } from "../actions";
import { AccountHeader } from "@/components/auth/AccountHeader";
import { NewsRow } from "@/components/story/NewsRow";
import { PageLinks } from "@/components/ui/PageLinks";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { engagementApi } from "@/lib/engagement";
import { formatDateTime } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Saxladıqlarım", robots: { index: false, follow: false } };

export default function SavedPage({ searchParams }: PageProps<"/hesab/saxlanilanlar">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Saved searchParams={searchParams} />
    </Suspense>
  );
}

async function Saved({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  if (!user) redirect("/hesab");
  const page = Math.max(1, Number(typeof params.page === "string" ? params.page : 1) || 1);
  const saved = await engagementApi.saved(page);

  return (
    <section className="mx-auto max-w-[900px] py-10">
      <AccountHeader user={user} active="saved" />
      <div className="mt-6" />
      {saved.items.length === 0 ? (
        <p className="py-10 text-center text-lg text-muted">
          Hələ heç nə saxlamamısınız. Xəbər səhifəsində &quot;Saxla&quot; düyməsinə basın, sonra oxumaq üçün burada tapın.
        </p>
      ) : (
        <div className="divide-y divide-rule">
          {saved.items.map((item) => (
            <NewsRow
              key={item.id}
              item={item}
              note={`Saxlanılıb: ${formatDateTime(item.at)}`}
              action={
                <form action={removeSaved}>
                  <input type="hidden" name="articleId" value={item.id} />
                  <input type="hidden" name="slug" value={item.slug} />
                  <button type="submit" className="font-sans text-sm text-muted hover:text-signal">
                    Siyahıdan çıxar
                  </button>
                </form>
              }
            />
          ))}
        </div>
      )}
      <PageLinks page={saved.page} pages={saved.pages} href={(p) => `/hesab/saxlanilanlar?page=${p}`} />
    </section>
  );
}
