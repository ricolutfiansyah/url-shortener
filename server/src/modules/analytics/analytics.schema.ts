import * as z from 'zod'

export const analyticsSchema = z.object({
    linkId: z.string(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    country: z.string().optional(),
    platform: z.string().optional(),
    browser: z.string().optional(),
})

export type AnalyticsSchema = z.infer<typeof analyticsSchema>