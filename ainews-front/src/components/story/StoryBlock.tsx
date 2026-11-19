import type { ReactNode } from "react";

type Props = {
  title: string;
  note?: string;
  children: ReactNode;
};

export function StoryBlock({ title, note, children }: Props) {
  return (
    <section className="border-t border-ink pt-4">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-[22px] font-semibold tracking-tight">{title}</h2>
        {note && <p className="font-sans text-xs text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}
