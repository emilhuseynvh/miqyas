import type { Perspective, Tone } from "@/lib/types";

const toneStyles: Record<Tone, string> = {
  dəstəkləyici: "bg-[#dfe8d2] text-[#3c5a23]",
  neytral: "bg-[#e3e2d6] text-[#4d4c42]",
  tənqidi: "bg-[#f1d9cc] text-[#8a3a1c]",
};

export function PerspectiveCard({ perspective }: { perspective: Perspective }) {
  const { outlet, country, framing, excerpt, tone } = perspective;
  return (
    <article className="flex h-full flex-col border-t border-ink pt-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-sm font-semibold">{outlet}</p>
          <p className="font-sans text-xs text-muted">{country}</p>
        </div>
        <span className={`shrink-0 rounded-sm px-1.5 py-0.5 font-sans text-[11px] font-medium ${toneStyles[tone]}`}>
          {tone}
        </span>
      </div>
      <p className="mt-3 font-serif text-lg font-semibold leading-tight">{framing}</p>
      <p className="mt-2 text-[15px] leading-snug text-muted">{excerpt}</p>
    </article>
  );
}
