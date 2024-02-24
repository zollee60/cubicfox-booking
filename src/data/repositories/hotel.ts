import { Hotel, HotelWithRelations, NewHotel, hotels } from '../../db/schema';
import { BaseRepository, BaseRepositoryDependencies } from './deps';
import { eq, sql } from 'drizzle-orm';

export interface HotelRepository extends BaseRepository<Hotel, NewHotel> {
  findAll: () => Promise<Hotel[]>;
  findAllWithRooms: () => Promise<HotelWithRelations[]>;
}

export const createHotelRepository = ({
  db,
  getNewId,
}: BaseRepositoryDependencies): HotelRepository => {
  return {
    create: async (hotel) => {
      return db.transaction(async (tx) => {
        const id = getNewId();
        await tx.insert(hotels).values({ ...hotel, id });

        const newHotel = await tx.query.hotels.findFirst({
          where: eq(hotels.id, id),
        });

        if (!newHotel) {
          throw new Error('Inserted hotel not found');
        }

        return newHotel;
      });
    },
    findById: async (id) => {
      return db.transaction(async (tx) => {
        return tx.query.hotels.findFirst({ where: eq(hotels.id, id) });
      });
    },
    findAll: async () => {
      return db.transaction(async (tx) => {
        return tx.query.hotels.findMany() as unknown as Promise<Hotel[]>;
      });
    },
    findAllWithRooms: async () => {
      return db.transaction(async (tx) => {
        return tx.query.hotels.findMany({
          with: { rooms: true },
        });
      });
    },
    update: async (hotel) => {
      return db.transaction(async (tx) => {
        await tx
          .insert(hotels)
          .values(hotel)
          .onDuplicateKeyUpdate({
            set: {
              name: hotel.name ?? sql`name`,
              city: hotel.city ?? sql`city`,
              address: hotel.address ?? sql`address`,
            },
          });

        const updatedHotel = await tx.query.hotels.findFirst({
          where: eq(hotels.id, hotel.id),
        });

        if (!updatedHotel) {
          throw new Error('Updated hotel not found');
        }

        return updatedHotel;
      });
    },
    delete: async (id) => {
      return db.transaction(async (tx) => {
        tx.delete(hotels).where(eq(hotels.id, id));
      });
    },
  };
};
