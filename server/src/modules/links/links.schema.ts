import * as z from 'zod'

const APP_DOMAIN = 'localhost:3000'

export const createLinkSchema = z.object({
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
    userId: z.string().optional(),
}).superRefine((data, ctx) => {
    try {
        const urlObj = new URL(data.originalUrl)
        if (urlObj.host === APP_DOMAIN) {
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

export type CreateLinkSchema = z.infer<typeof createLinkSchema>
