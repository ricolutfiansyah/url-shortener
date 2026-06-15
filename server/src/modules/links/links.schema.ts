import * as z from 'zod'

export const linkSchema = z.object({
    originalUrl: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                const trimmed = val.trim()
                const hasProtocol = /^https?:\/\//i.test(trimmed)
                const hasDot = trimmed.includes('.')

                if (trimmed && !hasProtocol && hasDot) {
                    return `https://${trimmed}`
                }
                return trimmed
            }
            return val
        },
        z.url({
            error: (issue) => issue.code === 'invalid_type' && issue.expected === 'string'
                ? 'Original URL is required!'
                : 'Invalid URL format!'
        })
    ),
    title: z
        .string()
        .max(50, 'Title must be at most 50 characters long.')
        .optional(),
    shortCode: z
        .string()
        .min(3, 'Custom alias must be at least 3 characters.')
        .max(30, 'Custom alias must be at most 30 characters.')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Alias can only contain letters, numbers, hyphens, and underscores.')
        .optional(),
    userId: z.string().optional(),
    expiresAt: z.coerce.date().optional(),
}).superRefine((data, ctx) => {
    try {
        const urlObj = new URL(data.originalUrl)
        if (urlObj.host === Bun.env.APP_DOMAIN) {
            ctx.addIssue({
                code: 'custom',
                message: 'You cannot shorten URLs belonging to this service!',
                path: ['originalUrl']
            })
        }
    } catch {
        // z.url() will already catch syntax errors
    }
})

export type LinkSchema = z.infer<typeof linkSchema>
