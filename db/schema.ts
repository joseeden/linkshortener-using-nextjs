import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const links = pgTable('links', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('user_id').notNull(),
  url: text('url').notNull(),
  slug: text('slug').notNull().unique(),
  clicks: integer('clicks').notNull().default(0),
  isPermanent: boolean('is_permanent').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
