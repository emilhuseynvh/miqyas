import Link from "next/link";
import { fetchSource, setSourceActive, updateFeedUrl } from "@/app/(admin)/admin/actions";
import type { Source } from "@/lib/admin-api";
import { relativeTime } from "@/lib/relative-time";
import { EmptyRow, OpsButton, opsInput, StatusBadge, Table, Td, Th } from "./ui";

type Props = {
  sources: Source[];
  returnTo: string;
  now: number;
};

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export function SourcesTable({ sources, returnTo, now }: Props) {
  return (
    <Table
      head={
        <>
          <Th>Mənbə</Th>
          <Th>Status</Th>
          <Th className="text-right">Xəbər</Th>
          <Th>Son uğurlu</Th>
          <Th>Problem</Th>
          <Th className="text-right">Əməliyyat</Th>
        </>
      }
    >
      {sources.length === 0 && <EmptyRow colSpan={6}>Bu filtrə uyğun mənbə yoxdur.</EmptyRow>}
      {sources.map((source) => (
        <tr key={source.id} className={source.isActive ? "" : "bg-ops-bg/50 text-ops-muted"}>
          <Td className="min-w-[220px]">
            <a href={source.siteUrl} target="_blank" rel="noreferrer" className="font-medium hover:text-ops-accent">
              {source.name}
            </a>
            <p className="mt-0.5 text-xs text-ops-muted">
              {host(source.siteUrl)}
              {source.kind ? ` · ${source.kind}` : ""}
              {source.language !== "az" ? ` · ${source.language.toUpperCase()}` : ""}
            </p>
            <details className="group mt-1">
              <summary className="cursor-pointer list-none text-xs text-ops-accent hover:underline">
                {source.feedUrl ? "RSS linkini dəyiş" : "RSS linki əlavə et"}
              </summary>
              <form action={updateFeedUrl} className="mt-2 flex gap-2">
                <input type="hidden" name="id" value={source.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <label htmlFor={`feed-${source.id}`} className="sr-only">
                  RSS linki
                </label>
                <input
                  id={`feed-${source.id}`}
                  name="feedUrl"
                  type="url"
                  defaultValue={source.feedUrl ?? ""}
                  placeholder="https://sayt.az/rss"
                  className={`${opsInput} w-full min-w-[220px]`}
                />
                <OpsButton type="submit" variant="primary">
                  Saxla
                </OpsButton>
              </form>
            </details>
          </Td>
          <Td>
            <StatusBadge status={source.isActive ? source.status : "inactive"} />
            {source.consecutiveFailures > 1 && (
              <p className="mt-1 text-xs text-ops-bad">{source.consecutiveFailures} dəfə ardıcıl</p>
            )}
          </Td>
          <Td className="text-right tabular-nums">
            <Link href={`/admin/xeberler?sourceId=${source.id}`} className="hover:text-ops-accent">
              {source.articleCount.toLocaleString("az-AZ")}
            </Link>
          </Td>
          <Td className="whitespace-nowrap text-ops-muted">{relativeTime(source.lastSuccessAt, now)}</Td>
          <Td className="max-w-[280px]">
            {source.lastError ? (
              <p className="line-clamp-2 text-xs text-ops-bad" title={source.lastError}>
                {source.lastError}
              </p>
            ) : source.status === "no_feed" ? (
              <p className="text-xs text-ops-warn">RSS tapılmadı</p>
            ) : (
              <span className="text-ops-muted">—</span>
            )}
          </Td>
          <Td>
            <div className="flex justify-end gap-1">
              {source.feedUrl && source.isActive && (
                <form action={fetchSource}>
                  <input type="hidden" name="id" value={source.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <OpsButton type="submit" variant="quiet">
                    Yoxla
                  </OpsButton>
                </form>
              )}
              <form action={setSourceActive}>
                <input type="hidden" name="id" value={source.id} />
                <input type="hidden" name="isActive" value={String(!source.isActive)} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <OpsButton type="submit" variant="quiet" className={source.isActive ? "text-ops-muted" : ""}>
                  {source.isActive ? "Deaktiv et" : "Aktiv et"}
                </OpsButton>
              </form>
            </div>
          </Td>
        </tr>
      ))}
    </Table>
  );
}
