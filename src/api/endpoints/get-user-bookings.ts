import { z } from 'zod';
import { Endpoint, endpointErrorSchema } from '../endpoint';
import { BookingService, UserService } from '../../services';

export type GetUserBookingsDependencies = {
  userService: UserService;
  bookingService: BookingService;
};

const getUserBookingsInputSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});

export type GetUserBookingsInput = z.infer<typeof getUserBookingsInputSchema>;

const getUserBookingsOutputSchema = z.union([
  endpointErrorSchema,
  z.object({
    statusCode: z.number(),
    body: z.object({
      bookings: z.array(
        z.object({
          id: z.string(),
          roomId: z.string(),
          checkIn: z.string(),
          checkOut: z.string(),
          hotelId: z.string(),
          cost: z.number(),
          isDeleted: z.boolean(),
          createdAt: z.string(),
          updatedAt: z.string(),
          room: z.object({
            hotelId: z.string(),
            roomNumber: z.number(),
            price: z.number(),
          }),
          hotel: z.object({
            name: z.string(),
            city: z.string(),
            address: z.string(),
          }),
        })
      ),
    }),
  }),
]);

export type GetUserBookingsOutput = z.infer<typeof getUserBookingsOutputSchema>;

export const createGetUserBookings = ({
  userService,
  bookingService,
}: GetUserBookingsDependencies): Endpoint<
  GetUserBookingsInput,
  GetUserBookingsOutput
> => ({
  inputSchema: getUserBookingsInputSchema,
  outputSchema: getUserBookingsOutputSchema,
  method: 'GET',
  path: '/users/:userId/bookings',
  handler: async ({ params }) => {
    try {
      const { userId } = params;
      const user = await userService.getUserById({ id: userId });

      if (!user) {
        return {
          statusCode: 404,
          body: {
            message: 'User not found',
          },
        };
      }

      const userBookings = await bookingService.getAllByUserId({
        userId: user.id,
      });

      const bookings = userBookings.map((booking) => ({
        ...booking,
        checkIn: booking.checkIn.toLocaleDateString(),
        checkOut: booking.checkOut.toLocaleDateString(),
        createdAt: booking.createdAt.toLocaleDateString(),
        updatedAt: booking.updatedAt.toLocaleDateString(),
        room: {
          hotelId: booking.room.hotelId,
          roomNumber: booking.room.roomNumber,
          price: booking.room.price,
        },
        hotel: {
          name: booking.hotel.name,
          city: booking.hotel.city,
          address: booking.hotel.address,
        },
      }));

      return {
        statusCode: 200,
        body: {
          bookings,
        },
      };
    } catch (e) {
      return {
        statusCode: 500,
        body: {
          message: e instanceof Error ? e.message : 'Unknown error',
        },
      };
    }
  },
});
