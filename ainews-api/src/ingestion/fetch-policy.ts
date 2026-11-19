const BASE_INTERVAL_MS = 10 * 60 * 1000;
const MAX_INTERVAL_MS = 24 * 60 * 60 * 1000;
const FREE_RETRIES = 3;

export function retryIntervalMs(consecutiveFailures: number): number {
  if (consecutiveFailures < FREE_RETRIES) return 0;
  return Math.min(BASE_INTERVAL_MS * 2 ** (consecutiveFailures - FREE_RETRIES), MAX_INTERVAL_MS);
}

export function isDue(
  source: { consecutiveFailures: number; lastFetchedAt: Date | null },
  now: Date = new Date(),
): boolean {
  if (!source.lastFetchedAt) return true;
  return now.getTime() - source.lastFetchedAt.getTime() >= retryIntervalMs(source.consecutiveFailures);
}

export function blockReason(status: number, body: string, headers: Headers): string | null {
  if (headers.get('cf-mitigated') === 'challenge' || /<title>Just a moment\.\.\.<\/title>/i.test(body)) {
    return 'Blocked by Cloudflare bot protection';
  }
  if (/aes\.min\.js|slowAES/i.test(body)) return 'Blocked by JavaScript bot check';
  if (status === 403) return 'HTTP 403: access denied for this server';
  return null;
}
