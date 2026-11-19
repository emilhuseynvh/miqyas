import { requestLink } from "@/app/(site)/hesab/actions";
import { inputClass } from "./TextField";

export function EmailLinkForm({ defaultEmail }: { defaultEmail?: string }) {
  return (
    <form action={requestLink}>
      <label htmlFor="email" className="mb-1 block font-sans text-sm">
        E-poçt ünvanı
      </label>
      <div className="flex">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          placeholder="E-poçt ünvanı"
          className={inputClass}
        />
        <button
          type="submit"
          className="shrink-0 border border-l-0 border-ink bg-card px-4 font-serif text-lg font-semibold transition-colors hover:bg-ink hover:text-paper"
        >
          Link al
        </button>
      </div>
    </form>
  );
}
