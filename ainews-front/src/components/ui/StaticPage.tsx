import type { ReactNode } from "react";

type Props = {
  title: string;
  lead?: string;
  children: ReactNode;
};

export function StaticPage({ title, lead, children }: Props) {
  return (
    <article className="mx-auto max-w-[720px] py-12">
      <h1 className="font-serif text-[40px] font-semibold leading-tight tracking-tight">{title}</h1>
      {lead && <p className="mt-4 text-xl leading-snug text-muted">{lead}</p>}
      <div className="mt-8 space-y-5 text-[18px] leading-[1.65] [&_a]:text-accent [&_a]:underline [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </article>
  );
}
