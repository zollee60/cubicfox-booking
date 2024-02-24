import {
  mysqlTable,
  timestamp,
  varchar,
  boolean,
  int,
} from 'drizzle-orm/mysql-core';
import { v4 } from 'uuid';
import { Room, rooms } from './rooms';
import { User, users } from './users';
import { relations } from 'drizzle-orm';
import { Hotel, hotels } from './hotels';

export const bookings = mysqlTable('bookings', {
  id: varchar('id', { length: 36 })
    .$defaultFn(() => v4())
    .primaryKey(),
  roomId: varchar('room_id', { length: 36 })
    .notNull()
    .references(() => rooms.id),
  hotelId: varchar('hotel_id', { length: 36 })
    .notNull()
    .references(() => hotels.id),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id),
  checkIn: timestamp('check_in').notNull(),
  checkOut: timestamp('check_out').notNull(),
  cost: int('cost').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export const boonkingsRelations = relations(bookings, ({ one }) => ({
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id],
  }),
  hotel: one(hotels, {
    fields: [bookings.hotelId],
    references: [hotels.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
}));

export type BookingWithRelations = Booking & {
  room: Room;
  hotel: Hotel;
  user: User;
};
