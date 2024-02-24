import {
  Booking,
  BookingWithRelations,
  NewBooking,
  bookings,
} from '../../db/schema';
import { BaseRepository, BaseRepositoryDependencies } from './deps';
import { and, eq, gte, lte, or, sql } from 'drizzle-orm';

export interface BookingRepository extends BaseRepository<Booking, NewBooking> {
  findAllByUserId: ({
    userId,
    limit,
    offset,
  }: {
    userId: string;
    limit?: number;
    offset?: number;
  }) => Promise<Omit<BookingWithRelations, 'user'>[]>;
  findAllByDateInterval: (from: Date, to: Date) => Promise<Booking[]>;
  findAll: ({
    includeDeleted,
  }: {
    includeDeleted?: boolean;
  }) => Promise<Booking[]>;
  findAllCurrent: ({
    includeDeleted,
  }: {
    includeDeleted?: boolean;
  }) => Promise<Booking[]>;
  softDelete: (id: string) => Promise<void>;
}

export const createBookingRepository = ({
  db,
  getNewId,
}: BaseRepositoryDependencies): BookingRepository => {
  return {
    create: async (booking) => {
      return db.transaction(async (tx) => {
        const id = getNewId();
        await tx.insert(bookings).values({ ...booking, id });

        const newBooking = await tx.query.bookings.findFirst({
          where: eq(bookings.id, id),
        });

        if (!newBooking) {
          throw new Error('Inserted booking not found');
        }

        return newBooking;
      });
    },
    findById: async (id) => {
      return db.transaction(async (tx) => {
        return tx.query.bookings.findFirst({ where: eq(bookings.id, id) });
      });
    },
    findAllByUserId: async ({ userId, limit, offset }) => {
      return db.transaction(async (tx) => {
        return tx.query.bookings.findMany({
          limit,
          offset,
          where: eq(bookings.userId, userId),
          with: { room: true, hotel: true },
        });
      });
    },
    findAllByDateInterval: async (from, to) => {
      return db.transaction(async (tx) => {
        return tx.query.bookings.findMany({
          where: and(lte(bookings.checkOut, to), gte(bookings.checkIn, from)),
        });
      });
    },
    findAll: async ({ includeDeleted = false }) => {
      return db.transaction(async (tx) => {
        return tx.query.bookings.findMany({
          where: includeDeleted
            ? or(eq(bookings.isDeleted, false), eq(bookings.isDeleted, true))
            : eq(bookings.isDeleted, false),
        });
      });
    },
    findAllCurrent: async ({ includeDeleted = false }) => {
      return db.transaction(async (tx) => {
        return tx.query.bookings.findMany({
          where: and(
            or(
              eq(bookings.isDeleted, false),
              eq(bookings.isDeleted, includeDeleted)
            ),
            gte(bookings.checkIn, new Date())
          ),
        });
      });
    },
    update: async (booking) => {
      return db.transaction(async (tx) => {
        await tx
          .insert(bookings)
          .values(booking)
          .onDuplicateKeyUpdate({
            set: {
              userId: booking.userId ?? sql`userId`,
              roomId: booking.roomId ?? sql`roomId`,
              checkIn: booking.checkIn ?? sql`checkIn`,
              checkOut: booking.checkOut ?? sql`checkOut`,
            },
          });

        const updatedBooking = await tx.query.bookings.findFirst({
          where: eq(bookings.id, booking.id),
        });

        if (!updatedBooking) {
          throw new Error('Updated booking not found');
        }

        return updatedBooking;
      });
    },
    softDelete: async (id) => {
      return db.transaction(async (tx) => {
        const booking = await tx.query.bookings.findFirst({
          where: eq(bookings.id, id),
        });

        if (!booking) {
          throw new Error('Booking not found');
        }

        tx.insert(bookings)
          .values(booking)
          .onDuplicateKeyUpdate({ set: { isDeleted: true } });
      });
    },
    delete: async (id) => {
      return db.transaction(async (tx) => {
        tx.delete(bookings).where(eq(bookings.id, id));
      });
    },
  };
};
