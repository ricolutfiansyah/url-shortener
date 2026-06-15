import { Hono } from 'hono';
import { validate } from '../../middlewares/validate';
import { linkSchema } from './links.schema';
import { linksService } from './links.service';
import { UAParser } from 'ua-parser-js';
import { getConnInfo } from 'hono/bun';
import { analyticsService } from '../analytics/analytics.service';
import { authMiddleware, requireAdmin } from '../../middlewares/auth';
import { HTTPException } from 'hono/http-exception';
import { rateLimiter } from '../../middlewares/rateLimit';

const app = new Hono();

const linkRoutes = app
  .get('/', authMiddleware, requireAdmin, async (c) => {
    const links = await linksService.getAllLinks();

    return c.json({
      success: true,
      message: 'All links fetched successfully!',
      data: links,
    });
  })
  .post('/', validate('json', linkSchema), async (c) => {
    const payload = c.req.valid('json');

    const newLink = await linksService.createShortUrl(payload);

    return c.json(
      {
        success: true,
        message: 'Short URL created successfully!',
        data: newLink,
      },
      201,
    );
  })
  .get('/info/:code', rateLimiter, async (c) => {
    const code = c.req.param('code');
    const link = await linksService.getOriginalUrl(code);

    if (!link) {
      return c.json(
        {
          success: false,
          message: 'Short URL not found',
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: 'Link stats fetched successfully!',
      data: {
        originalUrl: link.originalUrl,
        expires_at: link.expiresAt,
      },
    });
  })
  .get('/:code', async (c) => {
    const code = c.req.param('code');

    const link = await linksService.getOriginalUrl(code);

    if (link.expiresAt && new Date() > link.expiresAt) {
      throw new HTTPException(410, { message: 'URL has expired!' });
    }

    const userAgentString = c.req.header('User-Agent') || '';
    const ipAddress =
      c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
      getConnInfo(c).remote.address;

    const parser = new UAParser(userAgentString);
    const browserName = parser.getBrowser().name;
    const osName = parser.getOS().name;

    const trackingPromise = analyticsService
      .trackClick({
        linkId: link.id,
        ipAddress,
        userAgent: userAgentString,
        country: 'Indonesia',
        platform: osName,
        browser: browserName,
      })
      .catch((err) => console.error('Failed to track click!', err));

    try {
      // Run tracking in background, doesn't wait for it to finish
      c.executionCtx.waitUntil(trackingPromise);
    } catch {
      // No execution context, promise runs in background natively
    }

    return c.redirect(link.originalUrl, 302);
  })
  .delete('/:id', authMiddleware, requireAdmin, async (c) => {
    const id = c.req.param('id');
    await linksService.deleteLink(id);

    return c.json({
      success: true,
      message: 'Link deleted successfully!',
    });
  });

export default linkRoutes;
