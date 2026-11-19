import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "solid" | "highlight" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:bg-ink/85",
  highlight: "bg-band text-ink hover:bg-paper",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:bg-paper-deep",
};

type Size = "md" | "lg";

const sizes: Record<Size, string> = {
  md: "px-4 py-2 font-sans text-sm font-medium",
  lg: "px-6 py-3 font-serif text-lg font-semibold",
};

const base = "inline-flex items-center justify-center gap-2 transition-colors";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export function Button({ variant = "solid", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export function LinkButton({ href, variant = "solid", className = "", children }: LinkButtonProps) {
  return (
    <Link href={href} className={`${base} ${sizes.md} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
