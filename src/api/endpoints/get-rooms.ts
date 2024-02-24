import { z } from 'zod';
import { Endpoint, endpointErrorSchema } from '../endpoint';
import { RoomService } from '../../services';

export type GetRoomsDependencies = {
  roomService: RoomService;
};

const getRoomsInputSchema = z.object({
  query: z.object({
    limit: z.coerce.number(),
    offset: z.coerce.number(),
    price: z.coerce.number().optional(),
    checkIn: z.coerce.date().optional(),
    checkOut: z.coerce.date().optional(),
  }),
});

export type GetRoomsInput = z.infer<typeof getRoomsInputSchema>;

export const getRoomsOutputSchema = z.union([
  endpointErrorSchema,
  z.object({
    statusCode: z.number(),
    body: z.object({
      rooms: z.array(
        z.object({
          id: z.string(),
          hotelId: z.string(),
          roomNumber: z.number(),
          price: z.number(),
          overallCost: z.number(),
          hotel: z.object({
            id: z.string(),
            name: z.string(),
            city: z.string(),
            address: z.string(),
          }),
        })
      ),
    }),
  }),
]);

export type GetRoomsOutput = z.infer<typeof getRoomsOutputSchema>;

/**
 * @swagger
 *
 * /rooms:
 *   get:
 *     summary: Get a list of rooms
 *     responses:
 *       '200':
 *         description: A list of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Unauthorized
 * components:
 *  schemas:
 *   Room:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *       hotelId:
 *         type: string
 *       roomNumber:
 *         type: number
 *       price:
 *         type: number
 *       overallCost:
 *         type: number
 *       hotel:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *           name:
 *             type: string
 *           city:
 *             type: string
 *           address:
 *             type: string
 */
export const createGetRooms = ({
  roomService,
}: GetRoomsDependencies): Endpoint<GetRoomsInput, GetRoomsOutput> => ({
  inputSchema: getRoomsInputSchema,
  outputSchema: getRoomsOutputSchema,
  method: 'GET',
  path: '/rooms',
  handler: async ({ query }) => {
    try {
      const { checkIn, checkOut, price, limit, offset } = query;

      const availableRooms = await roomService.getAllAvailable({
        checkIn,
        checkOut,
        price,
      });

      const roomsSlice = availableRooms.slice(offset * limit, offset + limit);

      const days =
        checkIn && checkOut
          ? (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          : 1;

      const rooms = roomsSlice.map((room) => ({
        id: room.id,
        hotelId: room.hotelId,
        roomNumber: room.roomNumber,
        price: room.price,
        overallCost: room.price * days,
        hotel: {
          id: room.hotel.id,
          name: room.hotel.name,
          city: room.hotel.city,
          address: room.hotel.address,
        },
      }));

      return {
        statusCode: 200,
        body: {
          rooms,
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
