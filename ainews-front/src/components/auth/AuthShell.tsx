import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: Props) {
  return (
    <section className="mx-auto flex min-h-[52vh] max-w-[620px] flex-col justify-center py-16 text-center">
      <h1 className="font-serif text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-balance md:text-[36px]">
        {title}
      </h1>
      {subtitle && <p className="mt-3 font-serif text-xl md:text-2xl">{subtitle}</p>}
      <div className="mx-auto mt-8 w-full max-w-[520px] text-left">{children}</div>
    </section>
  );
}
