import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { v4 } from 'uuid';
import { User, users } from './users';
import { relations } from 'drizzle-orm';

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 36 })
    .$defaultFn(() => v4())
    .primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type SessionWithRelations = Session & {
  user: User;
};
