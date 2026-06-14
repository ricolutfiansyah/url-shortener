import type { UserSchema } from './users.schema';
import db from '../../db/client';
import { users, sessions } from '../../db/schema';
import { and, eq, gte } from 'drizzle-orm';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { HTTPException } from 'hono/http-exception';

export const userService = {
  async userRegister(user: UserSchema) {
    const existUser = await db.query.users.findFirst({
      where: eq(users.email, user.email),
    });

    if (existUser) {
      throw new HTTPException(400, { message: 'User already exists' });
    }

    const hashedPassword = await Bun.password.hash(user.password);

    const [newUser] = await db
      .insert(users)
      .values({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: 'user',
      })
      .returning();

    return { user: newUser };
  },

  async userLogin(user: UserSchema) {
    const existUser = await db.query.users.findFirst({
      where: eq(users.email, user.email),
    });

    if (!existUser) {
      throw new HTTPException(404, { message: 'Invalid credentials' });
    }

    const isPasswordValid = await Bun.password.verify(
      user.password,
      existUser.password,
    );

    if (!isPasswordValid) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    const accessToken = await generateAccessToken(existUser.id, existUser.role);
    const refreshToken = await generateRefreshToken(existUser.id);

    await db.insert(sessions).values({
      userId: existUser.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { user: existUser, accessToken, refreshToken };
  },

  async userTokenRefresh(incomingRefreshToken: string) {
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.refreshToken, incomingRefreshToken),
        gte(sessions.expiresAt, new Date()),
      ),
      with: { user: true },
    });

    if (!session) {
      throw new HTTPException(401, {
        message: 'Invalid or expired refresh token',
      });
    }

    const newAccessToken = await generateAccessToken(
      session.userId,
      session.user.role,
    );

    return { user: session.user, accessToken: newAccessToken };
  },

  async userLogout(incomingRefreshToken: string) {
    await db
      .delete(sessions)
      .where(eq(sessions.refreshToken, incomingRefreshToken));

    return;
  },

  async getAllUsers() {
    const users = await db.query.users.findMany();

    return users;
  },

  async getMe(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return user;
  },
};
