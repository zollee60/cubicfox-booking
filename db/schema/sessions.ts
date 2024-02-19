import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { v4 } from 'uuid';
import { users } from './users';

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 36 }).default(v4()).primaryKey(),
  user_id: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expires_at: timestamp('expires_at').notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
