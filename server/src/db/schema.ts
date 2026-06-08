import {
    pgTable,
    text,
    timestamp,
    uuid,
    pgEnum
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const roleEnum = pgEnum('role', ['user', 'admin'])

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name'),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: roleEnum('role').default('user').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const sessions = pgTable('sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    refreshToken: text('refresh_token').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const links = pgTable('links', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    title: text('title'),
    originalUrl: text('original_url').notNull(),
    shortCode: text('short_code').notNull().unique(),
    expiresAt: timestamp('expires_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const clicks = pgTable('clicks', {
    id: uuid('id').defaultRandom().primaryKey(),
    linkId: uuid('link_id').references(() => links.id, { onDelete: 'cascade' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    country: text('country'),
    platform: text('platform'),
    browser: text('browser'),
    clickedAt: timestamp('clicked_at', { mode: 'date' }).defaultNow().notNull(),
})

export const sessionRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}))