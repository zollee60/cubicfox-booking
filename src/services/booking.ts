import { BookingRepository } from '../data/repositories/booking';
import { RoomRepository } from '../data/repositories/room';
import { Booking, BookingWithRelations, NewBooking, Room } from '../db/schema';
import { AsyncService } from './service';

export type BookingServiceDependencies = {
  roomRepository: RoomRepository;
  bookingRepository: BookingRepository;
};

export type CreateBooking = AsyncService<NewBooking, Booking>;

export type GetAllByUserId = AsyncService<
  { userId: string },
  Omit<BookingWithRelations, 'user'>[]
>;

export type DeleteBooking = AsyncService<{ id: string }, void>;

export interface BookingService {
  create: CreateBooking;
  getAllByUserId: GetAllByUserId;
  delete: DeleteBooking;
}

export const createBookingService = ({
  roomRepository,
  bookingRepository,
}: BookingServiceDependencies): BookingService => {
  return {
    create: async (booking) => {
      const room = await roomRepository.findById(booking.roomId);

      if (!room) {
        throw new Error('Room not found');
      }

      return bookingRepository.create(booking);
    },
    getAllByUserId: async ({ userId }) => {
      return bookingRepository.findAllByUserId({ userId });
    },
    delete: async ({ id }) => {
      return bookingRepository.softDelete(id);
    },
  };
};
