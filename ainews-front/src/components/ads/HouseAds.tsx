import Link from "next/link";
import type { ReactNode } from "react";

const WORDS = ["reklamınız", "brendiniz", "kampaniyanız", "elanınız"];
const PITCH = "Azərbaycanın 200-dən çox xəbər saytını bir yerdə oxuyan auditoriyaya çatın.";

export function TopAd() {
  return (
    <AdFrame className="mb-3 px-4 pb-7 pt-6 md:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="font-serif text-[21px] font-semibold leading-[1.15] tracking-tight md:text-[28px]">
          Burada sizin <RotatingWord /> <span className="whitespace-nowrap">ola bilər</span>
        </p>
        <div className="flex items-center gap-5">
          <p className="hidden max-w-[30ch] font-sans text-[13px] leading-snug text-muted lg:block">{PITCH}</p>
          <AdLink />
        </div>
      </div>
      <HorizontalRuler />
    </AdFrame>
  );
}

export function RailAd({ side }: { side: "left" | "right" }) {
  const position = side === "left" ? "left-[calc(50%-816px)]" : "right-[calc(50%-816px)]";
  return (
    <div className={`fixed top-1/2 z-10 hidden w-[176px] -translate-y-1/2 min-[1680px]:block ${position}`}>
      <AdFrame className="flex h-[600px] flex-col justify-between py-10 pl-6 pr-3" labelClass="left-6">
        <p className="font-serif text-[20px] font-semibold leading-[1.25] tracking-tight [&_.word]:px-1">
          Burada sizin
          <br />
          <RotatingWord />
          <br />
          ola bilər
        </p>
        <div className="flex flex-col gap-4">
          <p className="font-sans text-[13px] leading-snug text-muted">{PITCH}</p>
          <AdLink />
        </div>
        <VerticalRuler />
      </AdFrame>
    </div>
  );
}

function AdFrame({ className, labelClass = "left-3", children }: { className: string; labelClass?: string; children: ReactNode }) {
  return (
    <aside aria-label="Reklam yeri" className={`relative isolate overflow-hidden bg-card ${className}`}>
      <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <rect
          x="1"
          y="1"
          className="fill-none stroke-ink motion-safe:animate-ad-march"
          style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }}
          strokeWidth="1.5"
          strokeDasharray="8 6"
        />
      </svg>
      <span className={`absolute top-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-muted ${labelClass}`}>
        Reklam yeri
      </span>
      {children}
    </aside>
  );
}

function RotatingWord() {
  return (
    <span className="relative inline-flex h-[1.15em] overflow-hidden align-bottom">
      <span className="flex flex-col motion-safe:animate-ad-words">
        {[...WORDS, WORDS[0]].map((word, i) => (
          <span key={i} className="word h-[1.15em] bg-band px-2 text-center">
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}

function AdLink() {
  return (
    <Link
      href="/reklam"
      className="inline-flex w-fit shrink-0 items-center bg-ink px-4 py-2 font-sans text-sm font-semibold text-paper transition-colors hover:bg-signal"
    >
      Reklam yerləşdir
    </Link>
  );
}

function HorizontalRuler() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-4 border-t border-ink/20" aria-hidden>
      <div className="size-full bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_1px,transparent_1px_10px)] bg-[length:100px_5px] bg-bottom-left bg-repeat-x opacity-40 motion-safe:animate-ad-ruler" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_1px,transparent_1px_50px)] bg-[length:100px_10px] bg-bottom-left bg-repeat-x opacity-60 motion-safe:animate-ad-ruler" />
      <span className="absolute -top-1 left-[2%] h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-signal motion-safe:animate-ad-sweep" />
    </div>
  );
}

function VerticalRuler() {
  return (
    <div className="absolute inset-y-0 left-0 w-4 border-r border-ink/20" aria-hidden>
      <div className="size-full bg-[repeating-linear-gradient(180deg,var(--color-ink)_0_1px,transparent_1px_10px)] bg-[length:5px_100px] bg-top-left bg-repeat-y opacity-40 motion-safe:animate-ad-ruler-y" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,var(--color-ink)_0_1px,transparent_1px_50px)] bg-[length:10px_100px] bg-top-left bg-repeat-y opacity-60 motion-safe:animate-ad-ruler-y" />
      <span className="absolute -right-1 top-[2%] h-0 w-0 border-y-[6px] border-r-[8px] border-y-transparent border-r-signal motion-safe:animate-ad-sweep-y" />
    </div>
  );
}
