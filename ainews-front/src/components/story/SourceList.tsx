import type { SourceLink } from "@/lib/types";

export function SourceList({ sources }: { sources: SourceLink[] }) {
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {sources.map((source) => (
        <li key={`${source.outlet}-${source.title}`}>
          <a href={source.url} className="flex items-baseline justify-between gap-4 py-3 hover:bg-paper-deep/60">
            <span>
              <span className="block font-sans text-xs text-muted">{source.outlet}</span>
              <span className="text-[16px] leading-snug">{source.title}</span>
            </span>
            <span className="shrink-0 font-sans text-xs text-accent">Orijinal</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
