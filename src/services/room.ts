import { BookingRepository } from '../data/repositories/booking';
import { RoomRepository } from '../data/repositories/room';
import { RoomWithRelations } from '../db/schema';
import { AsyncService } from './service';

export type RoomServiceDependencies = {
  roomRepository: RoomRepository;
  bookingRepository: BookingRepository;
  getDateTimeValueWithoutTime: (date?: Date) => number | undefined;
};

export type GetAllAvailableParams = {
  limit?: number;
  offset?: number;
  checkIn?: Date;
  checkOut?: Date;
  price?: number;
};

export type GetAllAvailable = AsyncService<
  GetAllAvailableParams,
  RoomWithRelations[]
>;

export type GetAll = AsyncService<
  { limit: number; offset: number },
  RoomWithRelations[]
>;

export type GetOne = AsyncService<
  { id: string },
  RoomWithRelations | undefined
>;

export type IsAvailableParams = {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
};

export type IsAvailable = AsyncService<IsAvailableParams, boolean>;

export interface RoomService {
  getOne: GetOne;
  getAll: GetAll;
  getAllAvailable: GetAllAvailable;
  isAvailable: IsAvailable;
}

export const createRoomService = ({
  roomRepository,
  bookingRepository,
  getDateTimeValueWithoutTime,
}: RoomServiceDependencies): RoomService => {
  return {
    getOne: async ({ id }) => {
      return roomRepository.findByIdWithHotel(id);
    },
    getAll: async ({ limit, offset }) => {
      return roomRepository.findAll({ limit, offset });
    },
    getAllAvailable: async ({ checkIn, checkOut, price }) => {
      const checkInWithoutTime = getDateTimeValueWithoutTime(checkIn);

      const checkOutWithoutTime = getDateTimeValueWithoutTime(checkOut);
      const bookings = await bookingRepository.findAllCurrent({});

      const rooms = await roomRepository.findAll({});

      return rooms.filter((room) => {
        const isInPriceRange = price ? room.price <= price : true;
        const isAvailable = !bookings.some((booking) => {
          const bookingCheckInWithoutTime = getDateTimeValueWithoutTime(
            booking.checkIn
          );
          const bookingCheckOutWithoutTime = getDateTimeValueWithoutTime(
            booking.checkOut
          );

          const isCheckInInsideBookingRange =
            checkInWithoutTime &&
            bookingCheckInWithoutTime &&
            bookingCheckOutWithoutTime
              ? bookingCheckInWithoutTime <= checkInWithoutTime &&
                bookingCheckOutWithoutTime >= checkInWithoutTime
              : false;
          const isCheckOutInsideBookingRange =
            checkOutWithoutTime &&
            bookingCheckInWithoutTime &&
            bookingCheckOutWithoutTime
              ? bookingCheckInWithoutTime <= checkOutWithoutTime &&
                bookingCheckOutWithoutTime >= checkOutWithoutTime
              : false;

          const isBookingInsideCheckInAndCheckOut =
            checkInWithoutTime &&
            checkOutWithoutTime &&
            bookingCheckInWithoutTime &&
            bookingCheckOutWithoutTime
              ? bookingCheckInWithoutTime >= checkInWithoutTime &&
                bookingCheckOutWithoutTime <= checkOutWithoutTime
              : false;
          return (
            booking.roomId === room.id &&
            (isCheckInInsideBookingRange ||
              isCheckOutInsideBookingRange ||
              isBookingInsideCheckInAndCheckOut)
          );
        });

        return isInPriceRange && isAvailable;
      });
    },

    isAvailable: async ({ roomId, checkIn, checkOut }) => {
      const bookings = await bookingRepository.findAllCurrent({});

      const checkInWithoutTime = new Date(
        checkIn.getFullYear(),
        checkIn.getMonth(),
        checkIn.getDate()
      ).getTime();

      const checkOutWithoutTime = new Date(
        checkOut.getFullYear(),
        checkOut.getMonth(),
        checkOut.getDate()
      ).getTime();

      const isAvailable = !bookings.some((booking) => {
        const bookingCheckInWithoutTime = new Date(
          booking.checkIn.getFullYear(),
          booking.checkIn.getMonth(),
          booking.checkIn.getDate()
        ).getTime();
        const bookingCheckOutWithoutTime = new Date(
          booking.checkOut.getFullYear(),
          booking.checkOut.getMonth(),
          booking.checkOut.getDate()
        ).getTime();
        const isCheckInInsideBookingRange =
          booking.roomId === roomId &&
          bookingCheckInWithoutTime <= checkInWithoutTime &&
          bookingCheckOutWithoutTime >= checkInWithoutTime;
        const isCheckOutInsideBookingRange =
          booking.roomId === roomId &&
          bookingCheckInWithoutTime <= checkOutWithoutTime &&
          bookingCheckOutWithoutTime >= checkOutWithoutTime;

        const isBookingInsideCheckInAndCheckOut =
          bookingCheckInWithoutTime >= checkInWithoutTime &&
          bookingCheckOutWithoutTime <= checkOutWithoutTime;
        return (
          isCheckInInsideBookingRange ||
          isCheckOutInsideBookingRange ||
          isBookingInsideCheckInAndCheckOut
        );
      });

      return isAvailable;
    },
  };
};
