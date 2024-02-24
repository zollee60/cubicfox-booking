import { NewRoom, Room, RoomWithRelations, rooms } from '../../db/schema';
import { BaseRepository, BaseRepositoryDependencies } from './deps';
import { eq, sql } from 'drizzle-orm';

export interface RoomRepository extends BaseRepository<Room, NewRoom> {
  findByIdWithHotel: (id: string) => Promise<RoomWithRelations | undefined>;
  findAllByHotelId: ({
    hotelId,
    limit,
    offset,
  }: {
    hotelId: string;
    limit?: number;
    offset?: number;
  }) => Promise<RoomWithRelations[]>;
  findAll: ({
    limit,
    offset,
  }: {
    limit?: number;
    offset?: number;
  }) => Promise<RoomWithRelations[]>;
}

export const createRoomRepository = ({
  db,
  getNewId,
}: BaseRepositoryDependencies): RoomRepository => {
  return {
    create: async (room) => {
      return db.transaction(async (tx) => {
        const id = getNewId();
        await tx.insert(rooms).values({ ...room, id });

        const newRoom = await tx.query.rooms.findFirst({
          where: eq(rooms.id, id),
        });

        if (!newRoom) {
          throw new Error('Inserted room not found');
        }

        return newRoom;
      });
    },
    findById: async (id) => {
      return db.transaction(async (tx) => {
        return tx.query.rooms.findFirst({ where: eq(rooms.id, id) });
      });
    },
    findByIdWithHotel: async (id) => {
      return db.transaction(async (tx) => {
        return tx.query.rooms.findFirst({
          where: eq(rooms.id, id),
          with: { hotel: true },
        });
      });
    },
    findAllByHotelId: async ({ hotelId, limit, offset }) => {
      return db.transaction(async (tx) => {
        return tx.query.rooms.findMany({
          limit,
          offset,
          where: eq(rooms.hotelId, hotelId),
          with: { hotel: true },
        });
      });
    },
    findAll: async ({ limit, offset }) => {
      return db.transaction(async (tx) => {
        return tx.query.rooms.findMany({
          limit,
          offset,
          with: { hotel: true },
        });
      });
    },
    update: async (room) => {
      return db.transaction(async (tx) => {
        await tx
          .insert(rooms)
          .values(room)
          .onDuplicateKeyUpdate({
            set: {
              hotelId: room.hotelId ?? sql`hotelId`,
              roomNumber: room.roomNumber ?? sql`roomNumber`,
              price: room.price ?? sql`price`,
            },
          });

        const updatedRoom = await tx.query.rooms.findFirst({
          where: eq(rooms.id, room.id),
        });

        if (!updatedRoom) {
          throw new Error('Updated room not found');
        }

        return updatedRoom;
      });
    },
    delete: async (id) => {
      return db.transaction(async (tx) => {
        tx.delete(rooms).where(eq(rooms.id, id));
      });
    },
  };
};
