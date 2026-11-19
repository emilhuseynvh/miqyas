import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/(site)/hesab/actions";
import type { User } from "@/lib/api";
import { site } from "@/lib/site";

export type AdminSection = "overview" | "sources" | "articles" | "users";

const nav: { key: AdminSection; href: string; label: string; icon: ReactNode }[] = [
  {
    key: "overview",
    href: "/admin",
    label: "Ümumi baxış",
    icon: <path d="M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z" />,
  },
  {
    key: "sources",
    href: "/admin/menbeler",
    label: "Mənbələr",
    icon: <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 19h.01" />,
  },
  {
    key: "articles",
    href: "/admin/xeberler",
    label: "Xəbərlər",
    icon: <path d="M4 5h16M4 10h16M4 15h10M4 20h7" />,
  },
  {
    key: "users",
    href: "/admin/istifadeciler",
    label: "İstifadəçilər",
    icon: <path d="M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  },
];

type Props = {
  user: User;
  section: AdminSection;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AdminShell({ user, section, title, description, actions, children }: Props) {
  return (
    <div className="min-h-dvh bg-ops-bg font-sans text-ops-ink md:grid md:grid-cols-[232px_1fr]">
      <aside className="flex flex-col bg-ops-side text-white md:sticky md:top-0 md:h-dvh">
        <div className="flex items-center justify-between px-5 py-5 md:block">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-black uppercase tracking-tight">{site.name}</span>
            <span className="text-[11px] font-medium text-ops-side-muted">idarəetmə</span>
          </Link>
        </div>
        <nav aria-label="Admin menyusu" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {nav.map((item) => {
            const active = item.key === section;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-white/10 font-medium text-white" : "text-ops-side-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-white/10 px-5 py-4 md:block">
          <p className="truncate text-sm font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-xs text-ops-side-muted">{user.email}</p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <Link href="/" className="text-ops-side-muted hover:text-white">
              Sayta keç
            </Link>
            <form action={logout}>
              <button type="submit" className="text-ops-side-muted hover:text-white">
                Çıxış
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-line bg-ops-panel px-5 py-5 md:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="mt-1 text-sm text-ops-muted">{description}</p>}
          </div>
          {actions}
        </header>
        <div className="px-5 py-6 md:px-8">{children}</div>
      </div>
    </div>
  );
}
