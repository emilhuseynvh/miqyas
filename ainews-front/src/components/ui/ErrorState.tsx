import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  action: ReactNode;
};

export function ErrorState({ title, description, action }: Props) {
  return (
    <div className="mx-auto max-w-[560px] py-20 text-center">
      <h1 className="font-serif text-[36px] font-semibold leading-tight tracking-tight">{title}</h1>
      <p className="mt-3 text-lg text-muted">{description}</p>
      <div className="mt-6 flex items-center justify-center gap-4">
        {action}
        <Link href="/" className="font-sans text-sm text-accent hover:underline">
          Ana səhifə
        </Link>
      </div>
    </div>
  );
}
