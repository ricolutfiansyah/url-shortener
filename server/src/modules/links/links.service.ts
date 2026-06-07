import db from "../../db/client"
import { links } from "../../db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { CreateLinkSchema } from "./links.schema"

export const linksService = {
    async createShortUrl(data: CreateLinkSchema) {

        let shortCode = nanoid(8)

        const existingLink = await db
            .select()
            .from(links)
            .where(eq(links.originalUrl, data.originalUrl))
            .limit(1)

        if (existingLink.length > 0) {
            return existingLink[0]
        }

        const [newLink] = await db.insert(links).values({
            originalUrl: data.originalUrl,
            shortCode,
            userId: data.userId || null,
            title: data.title || 'Untitled url',
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