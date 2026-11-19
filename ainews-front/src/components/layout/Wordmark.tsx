import Link from "next/link";
import { site } from "@/lib/site";

type Props = {
  size?: "lg" | "sm";
};

export function Wordmark({ size = "lg" }: Props) {
  const text = size === "lg" ? "text-[56px] md:text-[76px]" : "text-[34px]";
  return (
    <Link href="/" aria-label={`${site.name} ana səhifə`} className="inline-block">
      <span className={`block font-serif font-black uppercase leading-[0.85] tracking-[-0.03em] ${text}`}>
        {site.name}
      </span>
    </Link>
  );
}
