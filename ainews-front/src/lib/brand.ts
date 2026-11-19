export const MARK_PATH =
  "M12 48v-3h3V19h-3v-3h11l9 20 9-20h11v3h-3v26h3v3H40v-3h3V26l-9 20h-4l-9-20v19h3v3Z";

export const brandColors = { ink: "#1b1a16", paper: "#f7f3d9" } as const;

export function markSvg({ rounded = true }: { rounded?: boolean } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rounded ? 12 : 0}" fill="${brandColors.ink}"/><path d="${MARK_PATH}" fill="${brandColors.paper}"/></svg>`;
}

