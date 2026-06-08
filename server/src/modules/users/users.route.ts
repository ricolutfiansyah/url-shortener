import { Hono } from "hono";
import { authMiddleware } from "../../middlewares/auth";
import { AppVariables } from "../../types";
import { userService } from "./users.service";
import { sValidator } from "@hono/standard-validator";
import { userSchema } from "./users.schema";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

const app = new Hono<{ Variables: AppVariables }>()

const userRouter = app
    .get('/', authMiddleware, async (c) => {
        const users = await userService.getAllUsers()

        return c.json({
            success: true,
            message: 'All users fetched successfully!',
            data: users
        })
    })
    .get('/me', authMiddleware, async (c) => {
        const payload = c.get('jwtPayload')
        const userId = payload.sub

        if (!userId) {
            return c.json({
                success: false,
                message: 'User not found!',
            }, 404)
        }

        const user = await userService.getMe(userId)

        return c.json({
            success: true,
            message: 'User fetched successfully!',
            data: user
        })
    })
    .post('/register', sValidator('json', userSchema), async (c) => {
        const body = c.req.valid('json')

        const user = await userService.userRegister(body)

        return c.json({
            success: true,
            message: 'User registered successfully!',
            data: user
        }, 201)
    })
    .post('/login', sValidator('json', userSchema), async (c) => {
        const body = c.req.valid('json')

        const { user, accessToken, refreshToken } = await userService.userLogin(body)

        setCookie(c, 'refresh_token', refreshToken, {
            httpOnly: true,
            secure: Bun.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 24 * 7
        })

        return c.json({
            success: true,
            message: 'User logged in successfully!',
            data: user,
            accessToken
        })
    })
    .post('/refresh', async (c) => {
        const incomingRefreshToken = getCookie(c, 'refresh_token')

        if (!incomingRefreshToken) {
            return c.json({
                success: false,
                message: 'Refresh token not found!',
            }, 404)
        }

        const { user, accessToken } = await userService.userTokenRefresh(incomingRefreshToken)

        return c.json({
            success: true,
            message: 'Token refreshed successfully!',
            data: user,
            accessToken
        })
    })
    .post('/logout', authMiddleware, async (c) => {
        const incomingRefreshToken = getCookie(c, 'refresh_token')

        if (!incomingRefreshToken) {
            return c.json({ success: false, message: 'Already logged out' }, 400)
        }

        await userService.userLogout(incomingRefreshToken)
        deleteCookie(c, 'refresh_token')

        return c.json({
            success: true,
            message: 'User logged out successfully'
        })
    })

export default userRouter