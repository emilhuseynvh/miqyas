import { site } from "@/lib/site";

type Props = {
  path: string;
  title: string;
};

export function ShareLinks({ path, title }: Props) {
  const url = new URL(path, site.url).toString();
  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);
  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${text}%20${link}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${link}&text=${text}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
    { label: "X", href: `https://x.com/intent/post?url=${link}&text=${text}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm">
      <span className="text-muted">Paylaş:</span>
      {targets.map((target) => (
        <a key={target.label} href={target.href} target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
          {target.label}
        </a>
      ))}
    </div>
  );
}
