import Link from "next/link";

type Props = {
  href: string;
  value: number;
  label: string;
};

export function AccountStat({ href, value, label }: Props) {
  return (
    <Link href={href} className="group block border-t-2 border-ink pt-3">
      <span className="block font-serif text-[44px] font-semibold leading-none tabular-nums tracking-tight">
        {value.toLocaleString("az-AZ")}
      </span>
      <span className="mt-1 block font-sans text-sm text-muted group-hover:text-ink group-hover:underline">{label}</span>
    </Link>
  );
}
