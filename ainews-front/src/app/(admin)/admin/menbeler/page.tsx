import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { IngestionControl } from "@/components/admin/IngestionControl";
import { SourcesTable } from "@/components/admin/SourcesTable";
import { OpsButton, opsInput, Pagination, Panel, statusLabel } from "@/components/admin/ui";
import { adminApi, type SourceStatus } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-session";
import { getRequestTime } from "@/lib/clock";

export const metadata: Metadata = { title: "Mənbələr · Admin", robots: { index: false } };

type Params = Record<string, string | string[] | undefined>;

const filters: { label: string; status?: SourceStatus; active?: "false" }[] = [
  { label: "Hamısı" },
  { label: statusLabel("healthy"), status: "healthy" },
  { label: statusLabel("failing"), status: "failing" },
  { label: statusLabel("no_feed"), status: "no_feed" },
  { label: statusLabel("pending"), status: "pending" },
  { label: statusLabel("inactive"), active: "false" },
];

const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

function buildHref(base: { status?: string; active?: string; search?: string }, page?: number) {
  const params = new URLSearchParams();
  if (base.status) params.set("status", base.status);
  if (base.active) params.set("active", base.active);
  if (base.search) params.set("search", base.search);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/menbeler?${qs}` : "/admin/menbeler";
}

export default function SourcesPage({ searchParams }: PageProps<"/admin/menbeler">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Sources searchParams={searchParams} />
    </Suspense>
  );
}

async function Sources({ searchParams }: { searchParams: Promise<Params> }) {
  const [user, params] = await Promise.all([requireAdmin(), searchParams]);
  const current = { status: one(params.status), active: one(params.active), search: one(params.search) };
  const page = Math.max(1, Number(one(params.page) ?? 1) || 1);
  const [result, overview] = await Promise.all([
    adminApi.sources({ ...current, page, limit: 50 }),
    adminApi.overview(),
  ]);
  const now = await getRequestTime();
  const returnTo = buildHref(current, page);

  return (
    <AdminShell
      user={user}
      section="sources"
      title="Mənbələr"
      description={`${overview.sources.total} sayt izlənir, ${overview.sources.healthy} işləyir, ${overview.sources.failing} xəta verir, ${overview.sources.no_feed} saytın RSS-i yoxdur`}
      actions={<IngestionControl ingestion={overview.ingestion} returnTo={returnTo} now={now} />}
    >
      <AdminFlash params={params} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Status filtri" className="flex flex-wrap gap-1">
          {filters.map((filter) => {
            const active = filter.status === current.status && filter.active === current.active;
            return (
              <Link
                key={filter.label}
                href={buildHref({ status: filter.status, active: filter.active, search: current.search })}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  active ? "bg-ops-ink text-white" : "text-ops-muted hover:bg-ops-panel hover:text-ops-ink"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>
        <form action="/admin/menbeler" className="flex gap-2">
          {current.status && <input type="hidden" name="status" value={current.status} />}
          {current.active && <input type="hidden" name="active" value={current.active} />}
          <label htmlFor="source-search" className="sr-only">
            Mənbə axtar
          </label>
          <input id="source-search" name="search" defaultValue={current.search} placeholder="Ad və ya domen" className={`${opsInput} w-56`} />
          <OpsButton type="submit">Axtar</OpsButton>
        </form>
      </div>

      <Panel flush>
        <SourcesTable sources={result.items} returnTo={returnTo} now={now} />
        <Pagination page={result.page} pages={result.pages} total={result.total} buildHref={(p) => buildHref(current, p)} />
      </Panel>
    </AdminShell>
  );
}
