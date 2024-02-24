import { relations } from 'drizzle-orm';
import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { v4 } from 'uuid';
import { Room, rooms } from './rooms';

export const hotels = mysqlTable('hotels', {
  id: varchar('id', { length: 36 })
    .$defaultFn(() => v4())
    .primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;

export const hotelsRelations = relations(hotels, ({ many }) => ({
  rooms: many(rooms),
}));

export type HotelWithRelations = Hotel & {
  rooms: Room[];
};
