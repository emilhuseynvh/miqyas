import { connection } from "next/server";
import { Clock } from "./Clock";
import { zonedClock } from "@/lib/format";

type Zone = { label: string; timeZone: string };

export function ClockRow({ zones }: { zones: readonly Zone[] }) {
  return (
    <div className="flex gap-4">
      {zones.map((z) => (
        <Clock key={z.timeZone} label={z.label} />
      ))}
    </div>
  );
}

export async function WorldClocks({ zones }: { zones: readonly Zone[] }) {
  await connection();
  const now = new Date();
  return (
    <div className="flex gap-4">
      {zones.map((z) => {
        const { hours, minutes } = zonedClock(now, z.timeZone);
        return <Clock key={z.timeZone} label={z.label} hours={hours} minutes={minutes} />;
      })}
    </div>
  );
}
