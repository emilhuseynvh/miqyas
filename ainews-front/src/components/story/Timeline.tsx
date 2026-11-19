import type { TimelineEntry } from "@/lib/types";

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative ml-1 border-l border-rule">
      {entries.map((entry, i) => {
        const isLast = i === entries.length - 1;
        return (
          <li key={entry.date} className="relative pb-6 pl-6 last:pb-0">
            <span
              className={`absolute -left-[5px] top-1.5 size-[9px] rounded-full ${isLast ? "bg-signal" : "border border-ink bg-paper"}`}
              aria-hidden
            />
            <p className="font-sans text-xs font-semibold text-muted">{entry.date}</p>
            <p className={`mt-0.5 text-[16px] leading-snug ${isLast ? "font-semibold" : ""}`}>{entry.text}</p>
          </li>
        );
      })}
    </ol>
  );
}
