"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function SiteError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <ErrorState
      title="Səhifəni yükləmək alınmadı"
      description="Xəbərlər hazırda əlçatan deyil. Bir neçə saniyədən sonra yenidən yoxlayın."
      action={
        <button
          type="button"
          onClick={() => retry()}
          className="border border-ink px-4 py-2 font-sans text-sm font-medium hover:bg-ink hover:text-paper"
        >
          Yenidən yoxla
        </button>
      }
    />
  );
}
