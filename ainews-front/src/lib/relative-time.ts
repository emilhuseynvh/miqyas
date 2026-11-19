const rtf = new Intl.RelativeTimeFormat("az", { numeric: "auto" });

const steps: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export function relativeTime(iso: string | null, now: number): string {
  if (!iso) return "heç vaxt";
  const diff = Math.round((new Date(iso).getTime() - now) / 1000);
  for (const [unit, seconds] of steps) {
    if (Math.abs(diff) >= seconds) return rtf.format(Math.round(diff / seconds), unit);
  }
  return "indicə";
}
