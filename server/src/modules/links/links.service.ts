import db from "../../db/client"
import { links } from "../../db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import type { LinkSchema } from "./links.schema"
import { HTTPException } from "hono/http-exception"

export const linksService = {
    async createShortUrl(data: LinkSchema) {

        let shortCode = nanoid(8)

        const [newLink] = await db.insert(links).values({
            originalUrl: data.originalUrl,
            shortCode,
            userId: data.userId || null,
            title: data.title || 'Untitled url',
            expiresAt: data.expiresAt,
        }).returning()

        return newLink
    },

    async getOriginalUrl(shortCode: string) {

        const [link] = await db
            .select()
            .from(links)
            .where(eq(links.shortCode, shortCode))
            .limit(1)

        if (!link) {
            throw new HTTPException(404, { message: 'Link not found' })
        }

        if (link.expiresAt && link.expiresAt < new Date()) {
            throw new HTTPException(410, { message: 'This link has expired' })
        }

        return link
    }
}