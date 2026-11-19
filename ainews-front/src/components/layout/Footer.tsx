import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "./Wordmark";
import { getCategories } from "@/lib/data";
import { site } from "@/lib/site";

const primaryLinks = [
  { href: "/icmal", label: "Gündəlik icmal" },
  { href: "/axtaris", label: "Axtarış" },
  { href: site.telegramUrl, label: "Telegram kanalı" },
];

const briefings = [
  { href: "/kateqoriya/siyaset", label: "Siyasət", image: "https://picsum.photos/seed/miqyas-seher/160/160" },
  { href: "/kateqoriya/dunya", label: "Dünya", image: "https://picsum.photos/seed/miqyas-ai/160/160" },
  { href: "/kateqoriya/iqtisadiyyat", label: "İqtisadiyyat", image: "https://picsum.photos/seed/miqyas-bazar/160/160" },
  { href: "/kateqoriya/idman", label: "İdman", image: "https://picsum.photos/seed/miqyas-region/160/160" },
];

const companyLinks = [
  { href: "/menbeler", label: "Mənbələr" },
  { href: "/haqqimizda", label: "Haqqımızda" },
  { href: "/menbe-siyaseti", label: "Mənbə siyasəti" },
  { href: "/elaqe", label: "Əlaqə" },
];

const legalLinks = [
  { href: "/mexfilik", label: "Məxfilik" },
  { href: "/mexfilik#cookie", label: "Cookie" },
];

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="block py-1 font-serif text-base hover:underline">
      {children}
    </Link>
  );
}

export async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="mx-auto mt-24 w-full max-w-[1240px] px-4 md:px-6">
      <div className="border-t border-dashed border-ink pt-8 md:pt-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_240px_160px] md:gap-12">
          <div>
            <Wordmark size="sm" />
            <p className="mt-10 max-w-[14ch] font-serif text-[30px] font-light leading-[1.15] tracking-tight text-ink md:text-[35px]">
              {site.tagline}
            </p>
          </div>

          <nav aria-label="Bölmələr">
            <ul className="grid grid-cols-2 gap-x-6 md:block">
              <li>
                <Link href="/" className="block py-1 font-serif text-2xl hover:underline">
                  Əsas
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/kateqoriya/${c.slug}`} className="block py-1 font-serif text-2xl hover:underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col">
            {primaryLinks.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
            <p className="py-1 font-serif text-base">Bölmələr</p>
            <ul className="mt-1 grid grid-cols-4 gap-3 md:flex md:flex-col md:gap-4">
              {briefings.map((b) => (
                <li key={b.href}>
                  <Link href={b.href} className="group block" aria-label={b.label}>
                    <span className="relative block aspect-square w-full overflow-hidden md:size-20 border border-ink">
                      <Image src={b.image} alt="" fill sizes="80px" className="object-cover grayscale group-hover:grayscale-0" />
                    </span>
                    <span className="mt-1 block font-sans text-[11px] text-muted group-hover:text-ink">{b.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              {companyLinks.map((l) => (
                <FooterLink key={l.href} href={l.href}>
                  {l.label}
                </FooterLink>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 pb-6">
          <p className="font-serif text-base font-light">© 2026 {site.name}</p>
          <ul className="flex gap-6">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-serif text-base hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-dashed border-ink pb-8" />
      </div>
    </footer>
  );
}
