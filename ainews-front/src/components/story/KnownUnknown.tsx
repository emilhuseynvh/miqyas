type Props = {
  known: string[];
  unknown: string[];
};

function Column({ title, items, marker }: { title: string; items: string[]; marker: string }) {
  return (
    <div>
      <h3 className="font-sans text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[22px_1fr] text-[16px] leading-snug">
            <span className="font-sans text-sm font-semibold" aria-hidden>
              {marker}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KnownUnknown({ known, unknown }: Props) {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-10">
      <Column title="Təsdiqlənib" items={known} marker="✓" />
      <Column title="Hələ aydın deyil" items={unknown} marker="?" />
    </div>
  );
}
