import db from '../../db/client';
import { links } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { LinkSchema } from './links.schema';
import { HTTPException } from 'hono/http-exception';

export const linksService = {
  async createShortUrl(data: LinkSchema) {
    let shortCode = data.shortCode || nanoid(8);

    const existingLink = await db.query.links.findFirst({
      where: eq(links.shortCode, shortCode),
    });

    if (existingLink) {
      if (data.shortCode) {
        throw new HTTPException(400, {
          message: 'This custom alias is already taken!',
        });
      } else {
        throw new HTTPException(500, {
          message: 'A code collision occurred, please try again.',
        });
      }
    }

    const [newLink] = await db
      .insert(links)
      .values({
        originalUrl: data.originalUrl,
        shortCode,
        userId: data.userId || null,
        title: data.title || 'Untitled url',
        expiresAt: data.expiresAt,
      })
      .returning();

    return newLink;
  },

  async getOriginalUrl(shortCode: string) {
    const [link] = await db
      .select()
      .from(links)
      .where(eq(links.shortCode, shortCode))
      .limit(1);

    if (!link) {
      throw new HTTPException(404, { message: 'Link not found' });
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new HTTPException(410, { message: 'This link has expired' });
    }

    return link;
  },

  async getAllLinks() {
    const allLinks = await db.query.links.findMany();
    return allLinks;
  },

  async getUserLinks(userId: string) {
    const userLinks = await db.query.links.findMany({
      where: eq(links.userId, userId),
    });
    return userLinks;
  },

  async updateLink(linkId: string, data: LinkSchema) {
    const [updatedLink] = await db
      .update(links)
      .set({
        originalUrl: data.originalUrl,
        title: data.title || 'Untitled url',
        expiresAt: data.expiresAt,
      })
      .where(eq(links.id, linkId))
      .returning();

    if (!updatedLink) {
      throw new HTTPException(404, { message: 'Link not found' });
    }

    return updatedLink;
  },

  async deleteLink(linkId: string) {
    await db.delete(links).where(eq(links.id, linkId));

    return;
  },
};
