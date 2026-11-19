import Link from "next/link";
import { Suspense } from "react";
import { AccountLink, SignInLink } from "./AccountLink";
import { NavBar } from "./NavBar";
import { Today } from "./Today";
import { Wordmark } from "./Wordmark";
import { ClockRow, WorldClocks } from "./WorldClocks";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/lib/site";

const leftZones = site.clocks.slice(0, 3);
const rightZones = site.clocks.slice(3);

export function Header() {
  return (
    <header className="mx-auto w-full max-w-[1240px] px-4 pt-4 md:px-6">
      <div className="flex items-center justify-between gap-4 border-t border-rule pt-3">
        <Link
          href="/icmal"
          className="flex items-center gap-1.5 rounded-sm border border-rule bg-card px-2 py-1 font-sans text-xs font-semibold text-accent hover:border-ink"
        >
          <span className="size-2 rounded-full bg-band ring-1 ring-signal/60" aria-hidden />
          Gündəlik icmal
        </Link>
        <p className="hidden font-serif text-[15px] italic text-muted md:block">{site.tagline}</p>
        <div className="flex items-center gap-4">
          <Link href="/axtaris" className="flex items-center gap-1 font-sans text-xs font-semibold text-accent hover:underline">
            <Icon name="search" className="size-3.5" />
            Axtar
          </Link>
          <Suspense fallback={<SignInLink />}>
            <AccountLink />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 items-end gap-10 py-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="hidden items-end justify-between gap-6 lg:flex">
          <Suspense fallback={<p className="h-4" />}>
            <Today />
          </Suspense>
          <Suspense fallback={<ClockRow zones={leftZones} />}>
            <WorldClocks zones={leftZones} />
          </Suspense>
        </div>
        <div className="text-center">
          <Wordmark />
        </div>
        <div className="hidden lg:flex">
          <Suspense fallback={<ClockRow zones={rightZones} />}>
            <WorldClocks zones={rightZones} />
          </Suspense>
        </div>
      </div>

      <NavBar />

      <Link
        href="/icmal"
        className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 bg-band px-4 py-2.5 text-center hover:bg-band/80"
      >
        <span className="font-serif text-[15px] font-semibold">Hər səhər 08:00-da günün əsas xəbərləri e-poçtunda</span>
        <span className="font-serif text-[15px] text-accent underline underline-offset-2">Abunə ol</span>
      </Link>
    </header>
  );
}
