import Link from "next/link";

export type AccountSection = "profile" | "saved" | "history";

const items: { key: AccountSection; href: string; label: string }[] = [
  { key: "profile", href: "/hesab", label: "Ümumi" },
  { key: "saved", href: "/hesab/saxlanilanlar", label: "Saxladıqlarım" },
  { key: "history", href: "/hesab/tarixce", label: "Oxuduqlarım" },
];

export function AccountNav({ active }: { active: AccountSection }) {
  return (
    <nav aria-label="Hesab bölmələri" className="flex gap-6 overflow-x-auto border-y border-ink font-sans text-sm [scrollbar-width:none]">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.key === active ? "page" : undefined}
          className={`-mb-px whitespace-nowrap border-b-2 py-2.5 ${
            item.key === active ? "border-ink font-semibold" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
