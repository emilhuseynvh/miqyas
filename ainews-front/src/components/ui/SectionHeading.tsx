import Link from "next/link";

type Props = {
  title: string;
  href?: string;
  linkLabel?: string;
  as?: "h2" | "h3";
};

export function SectionHeading({ title, href, linkLabel = "Hamısına bax", as: Tag = "h2" }: Props) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4 border-t-2 border-ink pt-3">
      <Tag className="font-serif text-2xl font-semibold tracking-tight md:text-[28px]">{title}</Tag>
      {href && (
        <Link href={href} className="shrink-0 font-sans text-sm text-accent hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
