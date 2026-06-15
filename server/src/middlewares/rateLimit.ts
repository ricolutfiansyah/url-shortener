import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { getConnInfo } from 'hono/bun';

const ipTracker = new Map<string, { count: number; resetTime: number }>();

const LIMIT = 10;
const WINDOW_MS = 60 * 1000;

export const rateLimiter = createMiddleware(async (c, next) => {
  const ip =
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
    getConnInfo(c).remote.address ||
    'unknown';

  const now = Date.now();
  const record = ipTracker.get(ip);

  if (!record || record.resetTime < now) {
    ipTracker.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return await next();
  }

  record.count += 1;
  ipTracker.set(ip, record);

  if (record.count > LIMIT) {
    throw new HTTPException(429, {
      message: 'Too many requests, please try again in a minute',
    });
  }

  await next();
});
