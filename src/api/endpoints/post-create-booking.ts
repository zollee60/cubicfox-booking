import { z } from 'zod';
import { Endpoint, endpointErrorSchema } from '../endpoint';
import { BookingService, RoomService, UserService } from '../../services';

export type PostCreateBookingDependencies = {
  userService: UserService;
  bookingService: BookingService;
  roomService: RoomService;
  getDaysBetween: (checkIn: Date, checkOut: Date) => number;
};

const postCreateBookingInputSchema = z.object({
  body: z.object({
    roomId: z.string(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
  }),
  cookies: z.record(z.string()),
  params: z.object({
    id: z.string(),
  }),
});

export type PostCreateBookingInput = z.infer<
  typeof postCreateBookingInputSchema
>;

export const postCreateBookingOutputSchema = z.union([
  endpointErrorSchema,
  z.object({
    statusCode: z.number(),
    body: z.object({
      bookingId: z.string(),
    }),
  }),
]);

export type PostCreateBookingOutput = z.infer<
  typeof postCreateBookingOutputSchema
>;

/**
 *
 * @swagger
 * /users/{id}/bookings:
 *   post:
 *     summary: Create a new booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the User
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomId:
 *                 type: string
 *               checkIn:
 *                 type: string
 *                 format: date
 *               checkOut:
 *                 type: string
 *                 format: date
 *     responses:
 *       '200':
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookingId:
 *                   type: string
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Unauthorized
 */

export const createPostCreateBooking = ({
  userService,
  bookingService,
  roomService,
  getDaysBetween,
}: PostCreateBookingDependencies): Endpoint<
  PostCreateBookingInput,
  PostCreateBookingOutput
> => ({
  inputSchema: postCreateBookingInputSchema,
  outputSchema: postCreateBookingOutputSchema,
  method: 'POST',
  path: '/users/:id/bookings',
  handler: async ({ body, params }) => {
    try {
      const userId = params.id;
      const user = await userService.getUserById({ id: userId });

      const { checkIn, checkOut, roomId } = body;

      if (checkIn < new Date() || checkOut < new Date()) {
        return {
          statusCode: 400,
          body: {
            message: 'Check in and check out dates must be in the future',
          },
        };
      }

      if (checkIn > checkOut) {
        return {
          statusCode: 400,
          body: {
            message: 'Check out date must be after check in date',
          },
        };
      }

      const room = await roomService.getOne({ id: roomId });

      if (!room) {
        return {
          statusCode: 400,
          body: {
            message: 'Room not found',
          },
        };
      }

      const isAvailable = await roomService.isAvailable({
        roomId,
        checkIn,
        checkOut,
      });

      if (!isAvailable) {
        return {
          statusCode: 400,
          body: {
            message: 'Room is not available for the selected dates',
          },
        };
      }

      const days = getDaysBetween(checkIn, checkOut);

      const booking = await bookingService.create({
        checkIn,
        checkOut,
        roomId: room.id,
        userId: user.id,
        cost: room.price * days,
        hotelId: room.hotelId,
      });

      return {
        statusCode: 200,
        body: {
          bookingId: booking.id,
        },
      };
    } catch (e) {
      return {
        statusCode: 400,
        body: {
          message: e instanceof Error ? e.message : 'Unknown error',
        },
      };
    }
  },
});
