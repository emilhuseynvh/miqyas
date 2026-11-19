import { connection } from "next/server";
import { formatLongDate, formatTime } from "@/lib/format";

export async function Today() {
  await connection();
  const now = new Date();
  return (
    <p className="flex flex-col font-sans text-[11px] font-medium leading-tight text-muted">
      <span className="text-ink">Bakı {formatTime(now.toISOString())}</span>
      <span>{formatLongDate(now)}</span>
    </p>
  );
}
