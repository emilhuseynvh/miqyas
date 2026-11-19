const paths = {
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  thumbUp: "M7 22V11M2 13v7a2 2 0 0 0 2 2h12.4a2 2 0 0 0 2-1.6l1.5-7A2 2 0 0 0 18 11h-5V6a3 3 0 0 0-3-3l-3 8",
  thumbDown: "M17 2v11M22 11V4a2 2 0 0 0-2-2H7.6a2 2 0 0 0-2 1.6l-1.5 7A2 2 0 0 0 6 13h5v5a3 3 0 0 0 3 3l3-8",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
} as const;

export type IconName = keyof typeof paths;

type Props = {
  name: IconName;
  className?: string;
  filled?: boolean;
};

export function Icon({ name, className = "size-4", filled = false }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={paths[name]} />
    </svg>
  );
}
