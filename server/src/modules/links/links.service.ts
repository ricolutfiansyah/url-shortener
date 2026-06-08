import db from "../../db/client"
import { links } from "../../db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import type { CreateLinkSchema } from "./links.schema"

export const linksService = {
    async createShortUrl(data: CreateLinkSchema) {

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

        return link
    }
}