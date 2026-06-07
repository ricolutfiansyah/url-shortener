import { Hono } from "hono";
import { analyticsService } from "./analytics.service";

const app = new Hono()

const analyticsRoutes = app
    .get('/:linkId', async (c) => {
        const linkId = c.req.param('linkId')

        if (!linkId) {
            return c.json({ success: false, message: 'Link ID is required' }, 400)
        }

        try {
            const stats = await analyticsService.getLinkStats(linkId)

            if (!stats) {
                return c.json({ success: false, message: 'Link not found' }, 404)
            }

            return c.json({
                success: true,
                message: 'Fetch analytics stats successfully!',
                data: stats
            }, 200)
        } catch (error) {
            console.error('Failed to get analytics stats!', error)
            return c.json({ success: false, message: 'Internal server error' }, 500)
        }
    })

export default analyticsRoutes
