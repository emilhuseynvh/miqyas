import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { ArticlesTable } from "@/components/admin/ArticlesTable";
import { IngestionControl } from "@/components/admin/IngestionControl";
import { SourcesTable } from "@/components/admin/SourcesTable";
import { Metric, Panel } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-session";
import { getRequestTime } from "@/lib/clock";

export const metadata: Metadata = { title: "Ümumi baxış · Admin", robots: { index: false } };

export default function AdminOverviewPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Overview searchParams={searchParams} />
    </Suspense>
  );
}

async function Overview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [user, params] = await Promise.all([requireAdmin(), searchParams]);
  const [overview, failing, latest] = await Promise.all([
    adminApi.overview(),
    adminApi.sources({ status: "failing", active: true, limit: 8 }),
    adminApi.articles({ limit: 8 }),
  ]);
  const now = await getRequestTime();
  const { sources, articles } = overview;
  const coverage = sources.total ? Math.round((sources.healthy / sources.total) * 100) : 0;

  return (
    <AdminShell
      user={user}
      section="overview"
      title="Ümumi baxış"
      description="Mənbələrin vəziyyəti və toplanan xəbərlər"
      actions={<IngestionControl ingestion={overview.ingestion} returnTo="/admin" now={now} />}
    >
      <AdminFlash params={params} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="İşləyən mənbələr" value={sources.healthy} hint={`${sources.total} mənbədən, ${coverage}%`} tone="ok" href="/admin/menbeler?status=healthy" />
        <Metric label="Xəta verən" value={sources.failing} hint="Son yoxlamada oxunmadı" tone={sources.failing ? "bad" : "neutral"} href="/admin/menbeler?status=failing" />
        <Metric label="RSS-i olmayan" value={sources.no_feed} hint="Link əl ilə əlavə edilə bilər" tone="warn" href="/admin/menbeler?status=no_feed" />
        <Metric label="Deaktiv" value={sources.inactive} hint="Toplanmır" href="/admin/menbeler?active=false" />
        <Metric label="Bütün xəbərlər" value={articles.total} href="/admin/xeberler" />
        <Metric label="Son 24 saat" value={articles.last24h} tone="accent" />
        <Metric label="Son 1 saat" value={articles.lastHour} tone="accent" />
        <Metric label="İstifadəçilər" value={overview.users} hint={`${overview.subscribers} icmal abunəçisi`} href="/admin/istifadeciler" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel
          title="Xəta verən mənbələr"
          flush
          action={
            <Link href="/admin/menbeler?status=failing" className="text-xs text-ops-accent hover:underline">
              Hamısı
            </Link>
          }
        >
          <SourcesTable sources={failing.items} returnTo="/admin" now={now} />
        </Panel>
        <Panel
          title="Son toplanan xəbərlər"
          flush
          action={
            <Link href="/admin/xeberler" className="text-xs text-ops-accent hover:underline">
              Hamısı
            </Link>
          }
        >
          <ArticlesTable articles={latest.items} now={now} showSummary={false} />
        </Panel>
      </div>
    </AdminShell>
  );
}
