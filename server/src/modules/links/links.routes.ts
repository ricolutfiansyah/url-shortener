import { Hono } from "hono"
import { sValidator } from "@hono/standard-validator"
import { createLinkSchema } from "./links.schema"
import { linksService } from "./links.service"

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

        return c.redirect(link.originalUrl, 302)
    })

export default linkRoutes