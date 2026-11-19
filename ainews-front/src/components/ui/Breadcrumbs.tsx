import Link from "next/link";
import type { Crumb } from "@/lib/seo";

export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Naviqasiya yolu" className={`font-sans text-xs text-muted ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="line-clamp-1 text-ink">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-ink hover:underline">
                  {item.name}
                </Link>
              )}
              {!last && <span aria-hidden>›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
