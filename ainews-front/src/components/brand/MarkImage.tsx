import { brandColors, MARK_PATH } from "@/lib/brand";

export function MarkImage({ size, rounded = false }: { size: number; rounded?: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={size} height={size}>
      <rect width="64" height="64" rx={rounded ? 12 : 0} fill={brandColors.ink} />
      <path d={MARK_PATH} fill={brandColors.paper} />
    </svg>
  );
}
