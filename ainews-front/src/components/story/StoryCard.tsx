import Link from "next/link";
import { CategoryLabel } from "@/components/ui/CategoryLabel";
import { StoryImage } from "@/components/ui/StoryImage";
import type { NewsItem } from "@/lib/types";
import { SourceMeta } from "./SourceMeta";

type Variant = "lead" | "feature" | "split" | "grid" | "compact" | "text";

type Props = {
  item: NewsItem;
  variant?: Variant;
  showCategory?: boolean;
  eager?: boolean;
};

const titleStyles: Record<Variant, string> = {
  lead: "text-[32px] leading-[1.08] md:text-[44px] font-medium tracking-[-0.015em]",
  feature: "text-[22px] leading-[1.15] font-semibold tracking-[-0.01em]",
  split: "text-[28px] leading-[1.1] font-semibold tracking-[-0.015em]",
  grid: "text-[19px] leading-[1.2] font-semibold",
  compact: "text-[17px] leading-[1.25] font-semibold",
  text: "text-[19px] leading-[1.2] font-semibold",
};

export function StoryCard({ item, variant = "grid", showCategory = true, eager }: Props) {
  const href = `/xeber/${item.slug}`;
  const category = showCategory && item.category ? item.category : null;
  const title = (
    <h3 className={`font-serif text-balance ${titleStyles[variant]}`}>
      <Link href={href} className="decoration-1 underline-offset-4 hover:underline">
        {item.title}
      </Link>
    </h3>
  );
  const image = (ratio: "classic" | "square", sizes: string) => (
    <StoryImage src={item.imageUrl} alt="" fallbackLabel={item.source.name} ratio={ratio} sizes={sizes} eager={eager} />
  );

  if (variant === "lead") {
    return (
      <article className="flex flex-col items-center text-center">
        {category && <CategoryLabel category={category} className="mb-3" />}
        {title}
        {item.summary && <p className="mt-4 line-clamp-3 max-w-[52ch] text-lg leading-snug text-muted">{item.summary}</p>}
        <SourceMeta item={item} className="mt-3" />
        <Link href={href} className="mt-6 block w-full" tabIndex={-1} aria-hidden>
          {image("classic", "(min-width: 1024px) 560px, 100vw")}
        </Link>
      </article>
    );
  }

  if (variant === "split") {
    return (
      <article className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Link href={href} tabIndex={-1} aria-hidden>
          {image("classic", "(min-width: 768px) 480px, 100vw")}
        </Link>
        <div>
          {category && <CategoryLabel category={category} className="mb-2 inline-block" />}
          {title}
          {item.summary && <p className="mt-3 line-clamp-4 text-[17px] leading-snug text-muted">{item.summary}</p>}
          <SourceMeta item={item} className="mt-3" />
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="grid grid-cols-[1fr_96px] gap-4">
        <div>
          {category && <CategoryLabel category={category} className="mb-1 inline-block" />}
          {title}
          <SourceMeta item={item} className="mt-1.5" />
        </div>
        <Link href={href} tabIndex={-1} aria-hidden>
          {image("square", "96px")}
        </Link>
      </article>
    );
  }

  return (
    <article className="flex flex-col">
      {variant === "grid" && (
        <Link href={href} className="mb-3 block" tabIndex={-1} aria-hidden>
          {image("classic", "(min-width: 1024px) 300px, 50vw")}
        </Link>
      )}
      {category && <CategoryLabel category={category} className="mb-1" />}
      {title}
      {variant !== "grid" && item.summary && (
        <p className="mt-2 line-clamp-3 text-[16px] leading-snug text-muted">{item.summary}</p>
      )}
      <SourceMeta item={item} className="mt-2" />
      {variant === "feature" && (
        <Link href={href} className="mt-4 block" tabIndex={-1} aria-hidden>
          {image("classic", "(min-width: 1024px) 300px, 50vw")}
        </Link>
      )}
    </article>
  );
}
