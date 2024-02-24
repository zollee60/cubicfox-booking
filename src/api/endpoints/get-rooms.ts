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
