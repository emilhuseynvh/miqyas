import { runIngestion } from "@/app/(admin)/admin/actions";
import type { Overview } from "@/lib/admin-api";
import { relativeTime } from "@/lib/relative-time";
import { OpsButton } from "./ui";

type Props = {
  ingestion: Overview["ingestion"];
  returnTo: string;
  now: number;
};

export function IngestionControl({ ingestion, returnTo, now }: Props) {
  const run = ingestion.lastRun;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-ops-muted">
        {ingestion.running ? (
          <span className="flex items-center gap-2 text-ops-accent">
            <span className="size-2 animate-pulse rounded-full bg-current motion-reduce:animate-none" aria-hidden />
            Toplama gedir
          </span>
        ) : run ? (
          <>
            Son toplama {relativeTime(run.finishedAt, now)}: {run.succeeded}/{run.sources} mənbə, {run.inserted} yeni xəbər
          </>
        ) : (
          "Bu sessiyada toplama hələ işləməyib"
        )}
      </p>
      <form action={runIngestion}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <OpsButton type="submit" variant="primary" disabled={ingestion.running}>
          İndi topla
        </OpsButton>
      </form>
    </div>
  );
}
