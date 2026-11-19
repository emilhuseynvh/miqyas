"use client";

export default function AdminError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-ops-bg px-6 font-sans text-ops-ink">
      <div className="max-w-md rounded-lg border border-ops-line bg-ops-panel p-6 text-center">
        <h1 className="text-lg font-semibold">Panel yüklənmədi</h1>
        <p className="mt-2 text-sm text-ops-muted">API-yə qoşulmaq alınmadı. Backend işləyirmi?</p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-4 rounded-md bg-ops-ink px-3 py-1.5 text-sm font-medium text-white hover:bg-ops-ink/85"
        >
          Yenidən yoxla
        </button>
      </div>
    </div>
  );
}
