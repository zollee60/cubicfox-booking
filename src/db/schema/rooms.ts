import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { v4 } from 'uuid';
import { Hotel, hotels } from './hotels';
import { relations } from 'drizzle-orm';

export const rooms = mysqlTable('rooms', {
  id: varchar('id', { length: 36 })
    .$defaultFn(() => v4())
    .primaryKey(),
  hotelId: varchar('hotel_id', { length: 36 })
    .notNull()
    .references(() => hotels.id),
  roomNumber: int('room_number').notNull(),
  price: int('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

export const roomsRelations = relations(rooms, ({ one }) => ({
  hotel: one(hotels, {
    fields: [rooms.hotelId],
    references: [hotels.id],
  }),
}));

export type RoomWithRelations = Room & {
  hotel: Hotel;
};
