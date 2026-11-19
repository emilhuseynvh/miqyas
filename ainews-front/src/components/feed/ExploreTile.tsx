import Image from "next/image";
import Link from "next/link";
import { hideFromFeed } from "@/app/(site)/sizin-ucun/actions";
import type { FeedItem } from "@/lib/feed";

type Props = {
  item: FeedItem;
  large?: boolean;
  canHide: boolean;
  anchor?: string;
  eager?: boolean;
};

export function ExploreTile({ item, large = false, canHide, anchor, eager }: Props) {
  return (
    <article
      id={anchor}
      className={`group relative isolate overflow-hidden bg-ink ${large ? "col-span-2 row-span-2" : ""} aspect-square scroll-mt-6`}
    >
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt=""
          fill
          unoptimized
          referrerPolicy="no-referrer"
          loading={eager ? "eager" : "lazy"}
          sizes={large ? "(min-width: 1024px) 600px, 100vw" : "(min-width: 1024px) 300px, 50vw"}
          className="-z-10 object-cover text-transparent transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/45 to-transparent" aria-hidden />

      <Link href={`/xeber/${item.slug}${item.exploration ? "?kesf=1" : ""}`} className="absolute inset-0 flex flex-col justify-end p-3 text-paper md:p-4">
        <span
          className={`mb-2 self-start rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold md:text-[11px] ${
            item.exploration ? "bg-band text-ink" : "bg-paper/15 text-paper backdrop-blur-sm"
          }`}
        >
          {item.reason}
        </span>
        <h3
          className={`font-serif font-semibold leading-tight text-balance ${
            large ? "text-[22px] md:text-[30px]" : "line-clamp-4 text-[15px] md:text-[17px]"
          }`}
        >
          {item.title}
        </h3>
        <p className="mt-1.5 font-sans text-[11px] text-paper/70">{item.source.name}</p>
      </Link>

      {canHide && (
        <form action={hideFromFeed} className="absolute right-2 top-2">
          <input type="hidden" name="articleId" value={item.id} />
          <button
            type="submit"
            aria-label="Bunu az göstər"
            title="Bunu az göstər"
            className="grid size-7 place-items-center rounded-full bg-ink/55 font-sans text-sm text-paper opacity-80 backdrop-blur-sm hover:bg-ink hover:opacity-100 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            ✕
          </button>
        </form>
      )}
    </article>
  );
}
