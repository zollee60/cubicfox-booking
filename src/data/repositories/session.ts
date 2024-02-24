import {
  NewSession,
  Session,
  SessionWithRelations,
  sessions,
} from '../../db/schema';
import { BaseRepository, BaseRepositoryDependencies } from './deps';
import { eq, sql } from 'drizzle-orm';

export interface SessionRepository extends BaseRepository<Session, NewSession> {
  findByUserId: (userId: string) => Promise<SessionWithRelations | undefined>;
  findByIdWithUser: (id: string) => Promise<SessionWithRelations | undefined>;
}

export const createSessionRepository = ({
  db,
  getNewId,
}: BaseRepositoryDependencies): SessionRepository => {
  return {
    create: async (session) => {
      return db.transaction(async (tx) => {
        const id = getNewId();
        await tx.insert(sessions).values({ ...session, id });

        const newSession = await tx.query.sessions.findFirst({
          where: eq(sessions.id, id),
        });

        if (!newSession) {
          throw new Error('Inserted session not found');
        }

        return newSession;
      });
    },
    findById: async (id) => {
      return db.transaction(async (tx) => {
        return tx.query.sessions.findFirst({ where: eq(sessions.id, id) });
      });
    },
    findByUserId: async (userId) => {
      return db.transaction(async (tx) => {
        return tx.query.sessions.findFirst({
          with: { user: true },
          where: eq(sessions.userId, userId),
        });
      });
    },
    findByIdWithUser: async (id) => {
      return db.transaction(async (tx) => {
        return tx.query.sessions.findFirst({
          with: { user: true },
          where: eq(sessions.id, id),
        });
      });
    },
    update: async (session) => {
      return db.transaction(async (tx) => {
        await tx
          .insert(sessions)
          .values(session)
          .onDuplicateKeyUpdate({
            set: {
              userId: session.userId ?? sql`userId`,
              expiresAt: session.expiresAt ?? sql`expiresAt`,
            },
          });

        const updatedSession = await tx.query.sessions.findFirst({
          where: eq(sessions.id, session.id),
        });

        if (!updatedSession) {
          throw new Error('Updated session not found');
        }

        return updatedSession;
      });
    },
    delete: async (id) => {
      return db.transaction(async (tx) => {
        tx.delete(sessions).where(eq(sessions.id, id));
      });
    },
  };
};
