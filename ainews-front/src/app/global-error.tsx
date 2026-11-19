"use client";

import "./globals.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="az">
      <body className="grid min-h-dvh place-items-center bg-paper px-6 text-center font-serif text-ink">
        <div className="max-w-md">
          <h1 className="text-[34px] font-semibold leading-tight">Sayt hazırda işləmir</h1>
          <p className="mt-3 text-lg text-muted">Texniki problem yaranıb. Bir az sonra yenidən yoxlayın.</p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 border border-ink px-4 py-2 font-sans text-sm font-medium hover:bg-ink hover:text-paper"
          >
            Yenidən yoxla
          </button>
        </div>
      </body>
    </html>
  );
}
