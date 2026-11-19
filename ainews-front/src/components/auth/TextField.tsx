import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

export const inputClass =
  "w-full min-w-0 border border-ink bg-card px-3 py-2 font-serif text-lg placeholder:text-muted/70 focus:bg-paper focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent";

export function TextField({ label, name, id = name, className = "", ...props }: Props) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block font-sans text-sm">
        {label}
      </label>
      <input id={id} name={name} className={inputClass} {...props} />
    </div>
  );
}
