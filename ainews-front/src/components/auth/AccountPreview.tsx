import Link from "next/link";
import type { TimestampedNewsItem } from "@/lib/types";

type Props = {
  title: string;
  href: string;
  items: TimestampedNewsItem[];
  empty: string;
};

export function AccountPreview({ title, href, items, empty }: Props) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-2">
        <h2 className="font-serif text-xl font-semibold tracking-tight">{title}</h2>
        {items.length > 0 && (
          <Link href={href} className="font-sans text-sm text-accent hover:underline">
            Hamısı
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-[16px] text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-rule">
          {items.map((item) => (
            <li key={item.id} className="py-3">
              <Link href={`/xeber/${item.slug}`} className="font-serif text-[17px] font-semibold leading-snug hover:underline">
                {item.title}
              </Link>
              <p className="mt-1 font-sans text-xs text-muted">{item.source.name}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
