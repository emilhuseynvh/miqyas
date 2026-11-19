import { saveInterests } from "@/app/(site)/sizin-ucun/actions";
import { Button } from "@/components/ui/Button";
import type { Category } from "@/lib/types";

export function InterestPicker({ categories }: { categories: Category[] }) {
  return (
    <section className="mb-10 border border-ink bg-card p-5 md:p-7" aria-labelledby="interest-title">
      <h2 id="interest-title" className="font-serif text-2xl font-semibold tracking-tight">
        Maraqlarını seç
      </h2>
      <p className="mt-1 max-w-[60ch] text-[16px] text-muted">
        Ən azı 3 mövzu seç, lenti dərhal sənə uyğunlaşdıraq. Sonra oxuduqca, bəyəndikcə və saxladıqca lent özü öyrənəcək.
      </p>
      <form action={saveInterests} className="mt-5">
        <fieldset>
          <legend className="sr-only">Mövzular</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <label key={category.slug} className="cursor-pointer">
                <input type="checkbox" name="category" value={category.slug} className="peer sr-only" />
                <span className="inline-block rounded-full border border-ink/40 px-4 py-1.5 font-sans text-sm transition-colors hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" className="mt-5">
          Lenti qur
        </Button>
      </form>
    </section>
  );
}
