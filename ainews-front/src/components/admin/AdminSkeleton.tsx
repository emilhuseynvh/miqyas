export function AdminSkeleton() {
  return (
    <div className="min-h-dvh bg-ops-bg md:grid md:grid-cols-[232px_1fr]" aria-busy="true" aria-label="Yüklənir">
      <div className="hidden bg-ops-side md:block" />
      <div className="animate-pulse p-8 motion-reduce:animate-none">
        <div className="h-6 w-48 rounded bg-ops-line" />
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-ops-line/70" />
          ))}
        </div>
        <div className="mt-6 h-72 rounded-lg bg-ops-line/50" />
      </div>
    </div>
  );
}
