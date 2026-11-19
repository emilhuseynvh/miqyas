import Link from "next/link";

type Props = {
  page: number;
  pages: number;
  href: (page: number) => string;
  newerLabel?: string;
  olderLabel?: string;
};

export function PageLinks({ page, pages, href, newerLabel = "Əvvəlki", olderLabel = "Növbəti" }: Props) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Səhifələr" className="mt-10 flex items-center justify-between border-t border-dashed border-ink pt-4 font-sans text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className="text-accent hover:underline">
          {newerLabel}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-muted">
        Səhifə {page} / {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className="text-accent hover:underline">
          {olderLabel}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
