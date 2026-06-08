import { jwt } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import type { AppVariables } from "../types";

export const authMiddleware = jwt({
    secret: Bun.env.JWT_SECRET as string,
    alg: 'HS256'
})

export const requireAdmin = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    const payload = c.get('jwtPayload')

    if (!payload || payload.role !== 'admin') {
        return c.json({ success: false, message: 'Forbidden' }, 403)
    }

    await next()
})