import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { ArticlesTable } from "@/components/admin/ArticlesTable";
import { OpsButton, opsInput, Pagination, Panel } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-session";
import { getRequestTime } from "@/lib/clock";

export const metadata: Metadata = { title: "Xəbərlər · Admin", robots: { index: false } };

type Params = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

function buildHref(base: { sourceId?: string; search?: string }, page?: number) {
  const params = new URLSearchParams();
  if (base.sourceId) params.set("sourceId", base.sourceId);
  if (base.search) params.set("search", base.search);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/xeberler?${qs}` : "/admin/xeberler";
}

export default function ArticlesPage({ searchParams }: PageProps<"/admin/xeberler">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Articles searchParams={searchParams} />
    </Suspense>
  );
}

async function Articles({ searchParams }: { searchParams: Promise<Params> }) {
  const [user, params] = await Promise.all([requireAdmin(), searchParams]);
  const current = { sourceId: one(params.sourceId), search: one(params.search) };
  const page = Math.max(1, Number(one(params.page) ?? 1) || 1);
  const result = await adminApi.articles({ ...current, page, limit: 50 });
  const sourceName = current.sourceId ? result.items[0]?.source.name : undefined;
  const now = await getRequestTime();

  return (
    <AdminShell
      user={user}
      section="articles"
      title={sourceName ? `Xəbərlər: ${sourceName}` : "Xəbərlər"}
      description="RSS-dən toplanan xəbərlər, ən yenidən köhnəyə"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form action="/admin/xeberler" className="flex gap-2">
          {current.sourceId && <input type="hidden" name="sourceId" value={current.sourceId} />}
          <label htmlFor="article-search" className="sr-only">
            Başlıqda axtar
          </label>
          <input id="article-search" name="search" defaultValue={current.search} placeholder="Başlıqda axtar" className={`${opsInput} w-72`} />
          <OpsButton type="submit">Axtar</OpsButton>
        </form>
        {(current.sourceId || current.search) && (
          <Link href="/admin/xeberler" className="text-sm text-ops-accent hover:underline">
            Filtrləri təmizlə
          </Link>
        )}
      </div>

      <Panel flush>
        <ArticlesTable articles={result.items} now={now} />
        <Pagination page={result.page} pages={result.pages} total={result.total} buildHref={(p) => buildHref(current, p)} />
      </Panel>
    </AdminShell>
  );
}
