import { describe, expect, it } from 'vitest';
import { blockReason, isDue, retryIntervalMs } from './fetch-policy.js';

const minutes = (n: number) => n * 60 * 1000;

describe('retryIntervalMs', () => {
  it('retries the first failures on the normal schedule', () => {
    expect(retryIntervalMs(0)).toBe(0);
    expect(retryIntervalMs(2)).toBe(0);
  });

  it('backs off exponentially and caps at a day', () => {
    expect(retryIntervalMs(3)).toBe(minutes(10));
    expect(retryIntervalMs(4)).toBe(minutes(20));
    expect(retryIntervalMs(50)).toBe(minutes(24 * 60));
  });
});

describe('isDue', () => {
  const now = new Date('2026-11-19T12:00:00Z');

  it('fetches sources that were never fetched', () => {
    expect(isDue({ consecutiveFailures: 10, lastFetchedAt: null }, now)).toBe(true);
  });

  it('waits for the backoff interval', () => {
    const lastFetchedAt = new Date(now.getTime() - minutes(15));
    expect(isDue({ consecutiveFailures: 3, lastFetchedAt }, now)).toBe(true);
    expect(isDue({ consecutiveFailures: 4, lastFetchedAt }, now)).toBe(false);
  });
});

describe('blockReason', () => {
  it('detects a Cloudflare challenge', () => {
    const body = '<!DOCTYPE html><html><head><title>Just a moment...</title>';
    expect(blockReason(403, body, new Headers())).toBe('Blocked by Cloudflare bot protection');
  });

  it('detects a JavaScript cookie check', () => {
    const body = '<html><body><script src="/aes.min.js"></script>';
    expect(blockReason(200, body, new Headers())).toBe('Blocked by JavaScript bot check');
  });

  it('labels other 403 responses', () => {
    expect(blockReason(403, '<html>Forbidden</html>', new Headers())).toBe('HTTP 403: access denied for this server');
  });

  it('returns null for normal responses', () => {
    expect(blockReason(200, '<rss></rss>', new Headers())).toBeNull();
  });
});
