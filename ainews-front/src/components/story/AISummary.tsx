type Props = {
  points: string[];
  sourcesCount: number;
};

export function AISummary({ points, sourcesCount }: Props) {
  return (
    <section className="bg-band/60 px-5 py-5 md:px-6" aria-labelledby="ai-summary-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="ai-summary-title" className="font-serif text-[22px] font-semibold tracking-tight">
          Qısaca
        </h2>
        <p className="font-sans text-xs text-muted">AI xülasəsi, {sourcesCount} mənbə əsasında</p>
      </div>
      <ul className="mt-3 space-y-2.5">
        {points.map((point) => (
          <li key={point} className="grid grid-cols-[14px_1fr] text-[17px] leading-snug">
            <span className="mt-[9px] size-1.5 bg-ink" aria-hidden />
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
