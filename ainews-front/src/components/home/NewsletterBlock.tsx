import { subscribe } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export function NewsletterBlock() {
  return (
    <section id="abune" className="mt-16 grid scroll-mt-6 gap-6 bg-ink px-6 py-10 text-paper md:grid-cols-[1.2fr_1fr] md:items-center md:px-10">
      <div>
        <h2 className="font-serif text-[30px] font-semibold leading-tight tracking-tight">Gündəlik icmal</h2>
        <p className="mt-3 max-w-[48ch] text-[17px] leading-snug text-paper/75">
          Hər səhər beş dəqiqəyə günün ən vacib hadisələri: nə baş verib, niyə vacibdir və mənbələr nə deyir.
        </p>
      </div>
      <form action={subscribe} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          E-poçt ünvanı
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          placeholder="ad@nümunə.az"
          className="min-w-0 flex-1 border border-paper/40 bg-transparent px-3 py-2.5 font-sans text-sm text-paper placeholder:text-paper/50 focus:border-paper focus:outline-none"
        />
        <Button type="submit" variant="highlight">
          Abunə ol
        </Button>
      </form>
    </section>
  );
}
