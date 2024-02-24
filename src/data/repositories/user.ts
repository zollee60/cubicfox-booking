import { NewUser, User, users } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { BaseRepositoryDependencies, BaseRepository } from './deps';

export interface UserRepository extends BaseRepository<User, NewUser> {
  findByEmail: (email: string) => Promise<User | undefined>;
}

export const createUserRepository = ({
  db,
}: BaseRepositoryDependencies): UserRepository => {
  return {
    create: async (user) => {
      return db.transaction(async (tx) => {
        await tx.insert(users).values(user);

        // Drizzle combined with MySQL does not support returning the inserted row
        // So we have to query for the user after inserting it
        const newUser = await tx.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!newUser) {
          throw new Error('Inserted user not found');
        }

        return newUser;
      });
    },
    findById: async (id) => {
      return db.transaction(async (tx) => {
        return tx.query.users.findFirst({ where: eq(users.id, id) });
      });
    },
    findByEmail: async (email) => {
      return db.transaction(async (tx) => {
        return tx.query.users.findFirst({ where: eq(users.email, email) });
      });
    },
    update: async (user) => {
      return db.transaction(async (tx) => {
        await tx
          .insert(users)
          .values(user)
          .onDuplicateKeyUpdate({
            set: {
              email: user.email ?? sql`email`,
              password: user.password ?? sql`password`,
            },
          });

        const updatedUser = await tx.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!updatedUser) {
          throw new Error('Updated user not found');
        }

        return updatedUser;
      });
    },
    delete: async (id) => {
      return db.transaction(async (tx) => {
        tx.delete(users).where(eq(users.id, id));
      });
    },
  };
};
