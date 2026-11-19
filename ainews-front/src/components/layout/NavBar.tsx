import Link from "next/link";
import { getCategories } from "@/lib/data";

export async function NavBar() {
  const categories = await getCategories();
  return (
    <nav aria-label="Kateqoriyalar" className="border-y border-ink">
      <ul className="flex items-center gap-6 overflow-x-auto px-1 py-2.5 font-sans text-[13px] [scrollbar-width:none] md:justify-center">
        <li>
          <Link href="/" className="whitespace-nowrap font-semibold text-accent hover:underline">
            Əsas
          </Link>
        </li>
        <li>
          <Link href="/sizin-ucun" className="whitespace-nowrap font-semibold hover:underline">
            Sizin üçün
          </Link>
        </li>
        <li>
          <Link href="/son-xeberler" className="whitespace-nowrap font-semibold hover:underline">
            Son xəbərlər
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={`/kateqoriya/${c.slug}`} className="whitespace-nowrap hover:underline">
              {c.name}
            </Link>
          </li>
        ))}
        <li className="hidden h-4 border-l border-rule md:block" aria-hidden />
        <li>
          <Link href="/icmal" className="whitespace-nowrap font-semibold hover:underline">
            Gündəlik icmal
          </Link>
        </li>
      </ul>
    </nav>
  );
}
