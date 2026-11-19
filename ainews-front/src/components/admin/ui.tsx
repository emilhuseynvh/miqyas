import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { SourceStatus } from "@/lib/admin-api";

export function Panel({ title, action, children, flush }: { title?: string; action?: ReactNode; children: ReactNode; flush?: boolean }) {
  return (
    <section className="overflow-hidden rounded-lg border border-ops-line bg-ops-panel">
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-ops-line px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}

type Tone = "ok" | "warn" | "bad" | "neutral" | "accent";

const toneText: Record<Tone, string> = {
  ok: "text-ops-ok",
  warn: "text-ops-warn",
  bad: "text-ops-bad",
  neutral: "text-ops-ink",
  accent: "text-ops-accent",
};

export function Metric({ label, value, hint, tone = "neutral", href }: { label: string; value: string | number; hint?: string; tone?: Tone; href?: string }) {
  const body = (
    <>
      <p className="text-xs font-medium text-ops-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${toneText[tone]}`}>
        {typeof value === "number" ? value.toLocaleString("az-AZ") : value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-ops-muted">{hint}</p>}
    </>
  );
  const cls = "block rounded-lg border border-ops-line bg-ops-panel px-4 py-3";
  return href ? (
    <Link href={href} className={`${cls} hover:border-ops-accent/40`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

const statusMeta: Record<SourceStatus | "inactive", { label: string; cls: string }> = {
  healthy: { label: "İşləyir", cls: "bg-ops-ok/10 text-ops-ok" },
  failing: { label: "Xəta", cls: "bg-ops-bad/10 text-ops-bad" },
  no_feed: { label: "RSS yoxdur", cls: "bg-ops-warn/10 text-ops-warn" },
  pending: { label: "Gözləyir", cls: "bg-ops-accent/10 text-ops-accent" },
  inactive: { label: "Deaktiv", cls: "bg-ops-muted/10 text-ops-muted" },
};

export function StatusBadge({ status }: { status: SourceStatus | "inactive" }) {
  const meta = statusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${meta.cls}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {meta.label}
    </span>
  );
}

export const statusLabel = (status: SourceStatus | "inactive") => statusMeta[status].label;

type OpsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" };

const buttonVariants = {
  primary: "bg-ops-ink text-white hover:bg-ops-ink/85",
  secondary: "border border-ops-line bg-ops-panel text-ops-ink hover:border-ops-ink/30",
  quiet: "text-ops-accent hover:bg-ops-accent/5",
};

export function OpsButton({ variant = "secondary", className = "", ...props }: OpsButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export const opsInput =
  "rounded-md border border-ops-line bg-ops-panel px-3 py-1.5 text-sm text-ops-ink placeholder:text-ops-muted/70 focus:border-ops-accent focus:outline-none";

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-ops-muted ${className}`}>{children}</th>;
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-sm ${className}`}>{children}</td>;
}

export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="border-b border-ops-line bg-ops-bg/60">
          <tr>{head}</tr>
        </thead>
        <tbody className="divide-y divide-ops-line">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-ops-muted">
        {children}
      </td>
    </tr>
  );
}

export function Pagination({ page, pages, total, buildHref }: { page: number; pages: number; total: number; buildHref: (page: number) => string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-ops-line px-4 py-3 text-sm">
      <p className="text-ops-muted">
        Cəmi <span className="font-medium tabular-nums text-ops-ink">{total.toLocaleString("az-AZ")}</span>, səhifə {page} / {pages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={buildHref(page - 1)} className="rounded-md border border-ops-line px-3 py-1 hover:border-ops-ink/30">
            Əvvəlki
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={buildHref(page + 1)} className="rounded-md border border-ops-line px-3 py-1 hover:border-ops-ink/30">
            Növbəti
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function Flash({ tone, children }: { tone: "ok" | "bad"; children: ReactNode }) {
  return (
    <p
      role={tone === "bad" ? "alert" : "status"}
      className={`mb-4 rounded-md border px-3 py-2 text-sm ${
        tone === "ok" ? "border-ops-ok/30 bg-ops-ok/5 text-ops-ok" : "border-ops-bad/30 bg-ops-bad/5 text-ops-bad"
      }`}
    >
      {children}
    </p>
  );
}
