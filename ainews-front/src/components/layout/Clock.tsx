type Props = {
  label: string;
  hours?: number;
  minutes?: number;
};

export function Clock({ label, hours, minutes }: Props) {
  const hasTime = hours !== undefined && minutes !== undefined;
  const minuteAngle = hasTime ? minutes * 6 : 0;
  const hourAngle = hasTime ? (hours % 12) * 30 + minutes * 0.5 : 0;
  const title = hasTime ? `${label}: ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}` : label;

  return (
    <div className="flex flex-col items-center gap-1" title={title}>
      <span className="font-sans text-[10px] font-medium text-muted">{label}</span>
      <svg viewBox="0 0 32 32" className="size-7" role="img" aria-label={title}>
        <circle cx="16" cy="16" r="15" fill="var(--color-card)" stroke="var(--color-ink)" strokeWidth="1" />
        {hasTime && (
          <>
            <line x1="16" y1="16" x2="16" y2="9" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${hourAngle} 16 16)`} />
            <line x1="16" y1="16" x2="16" y2="5" stroke="var(--color-ink)" strokeWidth="1" strokeLinecap="round" transform={`rotate(${minuteAngle} 16 16)`} />
            <circle cx="16" cy="16" r="1.3" fill="var(--color-signal)" />
          </>
        )}
      </svg>
    </div>
  );
}
