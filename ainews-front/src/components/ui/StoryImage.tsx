import Image from "next/image";

type Props = {
  src: string | null;
  alt: string;
  fallbackLabel?: string;
  ratio?: "wide" | "classic" | "square";
  sizes?: string;
  eager?: boolean;
  caption?: string;
};

const ratios = {
  wide: "aspect-[16/9]",
  classic: "aspect-[3/2]",
  square: "aspect-square",
};

export function StoryImage({ src, alt, fallbackLabel, ratio = "classic", sizes = "100vw", eager, caption }: Props) {
  return (
    <figure>
      <div className={`relative overflow-hidden bg-paper-deep ${ratios[ratio]}`}>
        <span className="absolute inset-0 grid place-items-center p-3 text-center font-serif text-lg font-semibold text-muted" aria-hidden>
          {fallbackLabel}
        </span>
        {src && (
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            sizes={sizes}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            referrerPolicy="no-referrer"
            className="object-cover text-transparent"
          />
        )}
      </div>
      {caption && <figcaption className="mt-2 font-sans text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}
