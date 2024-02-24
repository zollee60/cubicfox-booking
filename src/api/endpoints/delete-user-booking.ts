import { z } from 'zod';
import { Endpoint, endpointErrorSchema } from '../endpoint';
import { BookingService, UserService } from '../../services';

export type DeleteUserBookingDependencies = {
  userService: UserService;
  bookingService: BookingService;
};

const deleteUserBookingInputSchema = z.object({
  params: z.object({
    userId: z.string(),
    bookingId: z.string(),
  }),
});

export type DeleteUserBookingInput = z.infer<
  typeof deleteUserBookingInputSchema
>;

const deleteUserBookingOutputSchema = z.union([
  endpointErrorSchema,
  z.object({
    statusCode: z.number(),
    body: z.object({}),
  }),
]);

export type DeleteUserBookingOutput = z.infer<
  typeof deleteUserBookingOutputSchema
>;

export const createDeleteUserBooking = ({
  userService,
  bookingService,
}: DeleteUserBookingDependencies): Endpoint<
  DeleteUserBookingInput,
  DeleteUserBookingOutput
> => ({
  inputSchema: deleteUserBookingInputSchema,
  outputSchema: deleteUserBookingOutputSchema,
  method: 'DELETE',
  path: '/users/:userId/bookings/:bookingId',
  handler: async ({ params }) => {
    try {
      const { userId, bookingId } = params;
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

      const bookingToDelete = userBookings.find(
        (booking) => booking.id === bookingId
      );

      if (!bookingToDelete) {
        return {
          statusCode: 404,
          body: {
            message: 'Booking not found for this user',
          },
        };
      }

      await bookingService.delete({ id: bookingId });

      return {
        statusCode: 204,
        body: {},
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
