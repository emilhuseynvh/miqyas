export function ArticleBody({ paragraphs }: { paragraphs: string[] }) {
  if (paragraphs.length === 0) {
    return <p className="text-[19px] text-muted">Mənbə bu xəbər üçün mətn təqdim etməyib.</p>;
  }

  return (
    <div className="max-w-[66ch] space-y-5 text-[19px] leading-[1.65]">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={i === 0 ? "text-[21px] leading-[1.55]" : undefined}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
