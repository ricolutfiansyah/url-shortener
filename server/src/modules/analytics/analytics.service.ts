import { count, eq } from "drizzle-orm";
import db from "../../db/client";
import { clicks } from "../../db/schema";
import type { AnalyticsSchema } from "./analytics.schema";

export const analyticsService = {
    async trackClick(data: AnalyticsSchema) {
        const { ipAddress, userAgent, country, platform, browser, linkId } = data

        const [newClick] = await db.insert(clicks).values({
            ipAddress,
            userAgent,
            country,
            platform,
            browser,
            linkId,
        }).returning()

        return newClick
    },

    async getLinkStats(linkId: string) {
        const [totalClickResult] = await db
            .select({ total: count() })
            .from(clicks)
            .where(eq(clicks.linkId, linkId))

        const totalClicks = totalClickResult?.total || 0

        const browserStats = await db
            .select({ name: clicks.browser, count: count() })
            .from(clicks)
            .where(eq(clicks.linkId, linkId))
            .groupBy(clicks.browser)

        const platformStats = await db
            .select({ name: clicks.platform, total: count() })
            .from(clicks)
            .where(eq(clicks.linkId, linkId))
            .groupBy(clicks.platform)

        return {
            totalClicks,
            browser: browserStats,
            platform: platformStats,
        }
    }
}