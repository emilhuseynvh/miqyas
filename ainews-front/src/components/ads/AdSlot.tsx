import Link from "next/link";

type Variant = "wide" | "box";

const WORDS = ["reklamınız", "brendiniz", "kampaniyanız", "elanınız"];

const layouts: Record<Variant, { frame: string; body: string; title: string }> = {
  wide: {
    frame: "min-h-[148px] px-6 pb-9 pt-7 md:px-10",
    body: "flex flex-col gap-5 md:flex-row md:items-center md:justify-between",
    title: "text-[26px] md:text-[34px]",
  },
  box: {
    frame: "min-h-[250px] px-5 pb-10 pt-8",
    body: "flex h-full flex-col justify-between gap-6",
    title: "text-[26px]",
  },
};

export function AdSlot({ variant = "wide", className = "" }: { variant?: Variant; className?: string }) {
  const layout = layouts[variant];
  return (
    <aside aria-label="Reklam yeri" className={`group relative isolate overflow-hidden bg-card ${layout.frame} ${className}`}>
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
      <span className="absolute left-3 top-2 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        Reklam yeri
      </span>

      <div className={`relative ${layout.body}`}>
        <p className={`font-serif font-semibold leading-[1.15] tracking-tight ${layout.title}`}>
          Burada sizin{" "}
          <span className="relative inline-flex h-[1.15em] overflow-hidden align-bottom">
            <span className="flex flex-col motion-safe:animate-ad-words">
              {[...WORDS, WORDS[0]].map((word, i) => (
                <span key={i} className="h-[1.15em] w-fit bg-band px-1.5">
                  {word}
                </span>
              ))}
            </span>
          </span>
          <br />
          ola bilər
        </p>
        <div className={variant === "wide" ? "flex flex-col gap-3 md:items-end" : "flex flex-col gap-3"}>
          <p className="max-w-[34ch] font-sans text-sm leading-snug text-muted">
            Azərbaycanın 200-dən çox xəbər saytını bir yerdə oxuyan auditoriyaya çatın.
          </p>
          <Link
            href="/reklam"
            className="inline-flex w-fit items-center gap-2 bg-ink px-4 py-2 font-sans text-sm font-semibold text-paper transition-colors hover:bg-signal"
          >
            Reklam yerləşdir
          </Link>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-5 border-t border-ink/20" aria-hidden>
        <div className="size-full bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_1px,transparent_1px_10px)] bg-[length:100px_6px] bg-bottom-left bg-repeat-x opacity-40 motion-safe:animate-ad-ruler" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_1px,transparent_1px_50px)] bg-[length:100px_12px] bg-bottom-left bg-repeat-x opacity-60 motion-safe:animate-ad-ruler" />
        <span className="absolute -top-1 left-[2%] h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-signal motion-safe:animate-ad-sweep" />
      </div>
    </aside>
  );
}
