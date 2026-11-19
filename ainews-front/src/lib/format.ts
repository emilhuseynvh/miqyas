const tz = "Asia/Baku";

const dayMonth = new Intl.DateTimeFormat("az-Latn-AZ", { day: "numeric", month: "long", timeZone: tz });
const hourMinute = new Intl.DateTimeFormat("az-Latn-AZ", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: tz,
});

const toDate = (iso: string | null | undefined): Date | null => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function formatDateTime(iso: string | null | undefined): string {
  const d = toDate(iso);
  return d ? `${dayMonth.format(d)}, ${hourMinute.format(d)}` : "";
}

const monthYear = new Intl.DateTimeFormat("az-Latn-AZ", { month: "long", year: "numeric", timeZone: tz });

export function formatMonthYear(iso: string | null | undefined): string {
  const d = toDate(iso);
  if (!d) return "";
  const text = monthYear.format(d);
  return text.charAt(0).toLocaleUpperCase("az") + text.slice(1);
}

export function formatTime(iso: string | null | undefined): string {
  const d = toDate(iso);
  return d ? hourMinute.format(d) : "";
}

export function formatLongDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat("az-Latn-AZ", { weekday: "long", timeZone: tz }).format(date);
  const day = new Intl.DateTimeFormat("az-Latn-AZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: tz,
  }).format(date);
  return `${weekday.charAt(0).toLocaleUpperCase("az")}${weekday.slice(1)}, ${day}`;
}

export function zonedClock(date: Date, timeZone: string): { hours: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone,
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { hours: get("hour") % 24, minutes: get("minute") };
}
