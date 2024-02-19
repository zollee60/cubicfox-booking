import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { v4 } from 'uuid';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).default(v4()).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
