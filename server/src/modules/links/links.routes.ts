import { Hono } from "hono"
import { sValidator } from "@hono/standard-validator"
import { createLinkSchema } from "./links.schema"
import { linksService } from "./links.service"
import { UAParser } from "ua-parser-js"
import { getConnInfo } from "hono/bun"
import { analyticsService } from "../analytics/analytics.service"

const app = new Hono()

const linkRoutes = app
    .post('/', sValidator('json', createLinkSchema), async (c) => {
        const payload = c.req.valid('json')

        const newLink = await linksService.createShortUrl(payload)

        return c.json({
            success: true,
            message: 'Short URL created successfully!',
            data: newLink
        }, 201)
    })

    .get('/:code', async (c) => {
        const code = c.req.param('code')

        const link = await linksService.getOriginalUrl(code)

        if (!link) {
            return c.text('URL not found or deleted!', 404)
        }

        const userAgentString = c.req.header('User-Agent') || ''
        const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0].trim() || getConnInfo(c).remote.address

        const parser = new UAParser(userAgentString)
        const browserName = parser.getBrowser().name
        const osName = parser.getOS().name

        const trackingPromise = analyticsService.trackClick({
            linkId: link.id,
            ipAddress,
            userAgent: userAgentString,
            country: 'Indonesia',
            platform: osName,
            browser: browserName,
        }).catch(err => console.error('Failed to track click!', err))

        // Run tracking in background, doesn't wait for it to finish
        try {
            c.executionCtx.waitUntil(trackingPromise)
        } catch {
            // No execution context, promise runs in background natively
        }

        return c.redirect(link.originalUrl, 302)
    })

export default linkRoutes