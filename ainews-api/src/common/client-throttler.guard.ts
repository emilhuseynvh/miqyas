import { type ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';

export const INTERNAL_TOKEN_HEADER = 'x-internal-token';
export const CLIENT_IP_HEADER = 'x-client-ip';

const header = (request: Request, name: string) => {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
};

function isInternal(request: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  const provided = header(request, INTERNAL_TOKEN_HEADER);
  if (!expected || !provided || expected.length !== provided.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

@Injectable()
export class ClientThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    return isInternal(request) && !header(request, CLIENT_IP_HEADER);
  }

  protected async getTracker(request: Record<string, unknown>): Promise<string> {
    const req = request as unknown as Request;
    const clientIp = isInternal(req) ? header(req, CLIENT_IP_HEADER) : undefined;
    return clientIp ?? req.ips[0] ?? req.ip ?? 'unknown';
  }
}
