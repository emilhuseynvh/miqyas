export function PageSkeleton() {
  return (
    <div className="mx-auto mt-10 max-w-[820px] animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Yüklənir">
      <div className="mx-auto h-4 w-24 bg-paper-deep" />
      <div className="mx-auto mt-4 h-12 w-full bg-paper-deep" />
      <div className="mx-auto mt-3 h-12 w-3/4 bg-paper-deep" />
      <div className="mx-auto mt-6 h-5 w-2/3 bg-paper-deep" />
      <div className="mt-10 aspect-[16/9] w-full bg-paper-deep" />
    </div>
  );
}
