import * as z from 'zod'

export const userSchema = z.object({
    name: z
        .string()
        .min(4, 'Name must be at least 4 characters long')
        .max(20, 'Name must be at most 20 characters long')
        .optional(),
    email: z
        .email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long'),
})

export type UserSchema = z.infer<typeof userSchema>