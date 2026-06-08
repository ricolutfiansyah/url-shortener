import { sign } from "hono/jwt";

export const generateAccessToken = async (userId: string, role: string) => {
    const payload = {
        sub: userId,
        role,
        exp: Math.floor(Date.now() / 1000) + (15 * 60),
    }

    return await sign(payload, Bun.env.JWT_SECRET!)
}

export const generateRefreshToken = async (userId: string) => {
    const payload = {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
    }

    return await sign(payload, Bun.env.JWT_REFRESH_SECRET!)
}