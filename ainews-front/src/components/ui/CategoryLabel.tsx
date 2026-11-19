import Link from "next/link";
import type { Category } from "@/lib/types";

type Props = {
  category: Pick<Category, "slug" | "name">;
  className?: string;
};

export function CategoryLabel({ category, className = "" }: Props) {
  return (
    <Link
      href={`/kateqoriya/${category.slug}`}
      className={`font-sans text-[13px] font-semibold text-accent hover:underline ${className}`}
    >
      {category.name}
    </Link>
  );
}
