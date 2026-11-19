import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { clearHistory } from "../actions";
import { AccountHeader } from "@/components/auth/AccountHeader";
import { NewsRow } from "@/components/story/NewsRow";
import { Button } from "@/components/ui/Button";
import { PageLinks } from "@/components/ui/PageLinks";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { engagementApi } from "@/lib/engagement";
import { formatDateTime } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Oxuduqlarım", robots: { index: false, follow: false } };

export default function HistoryPage({ searchParams }: PageProps<"/hesab/tarixce">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <History searchParams={searchParams} />
    </Suspense>
  );
}

async function History({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  if (!user) redirect("/hesab");
  const page = Math.max(1, Number(typeof params.page === "string" ? params.page : 1) || 1);
  const history = await engagementApi.history(page);

  return (
    <section className="mx-auto max-w-[900px] py-10">
      <AccountHeader user={user} active="history" />
      <div className="mt-6" />
      {history.items.length === 0 ? (
        <p className="py-10 text-center text-lg text-muted">Oxuduğunuz xəbərlər burada görünəcək.</p>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between font-sans text-sm text-muted">
            <span>{history.total.toLocaleString("az-AZ")} xəbər</span>
            <form action={clearHistory}>
              <Button type="submit" variant="ghost">
                Tarixçəni təmizlə
              </Button>
            </form>
          </div>
          <div className="divide-y divide-rule">
            {history.items.map((item) => (
              <NewsRow key={item.id} item={item} note={`Oxunub: ${formatDateTime(item.at)}`} />
            ))}
          </div>
        </>
      )}
      <PageLinks page={history.page} pages={history.pages} href={(p) => `/hesab/tarixce?page=${p}`} />
    </section>
  );
}
