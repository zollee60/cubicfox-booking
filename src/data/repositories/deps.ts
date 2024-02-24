import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../../db/schema';

export type BaseRepositoryDependencies = {
  db: MySql2Database<typeof schema>;
  getNewId: () => string;
};

export interface BaseRepository<T, U> {
  create: (entity: U) => Promise<T>;
  findById: (id: string) => Promise<T | undefined>;
  update: (user: U & { id: string }) => Promise<T>;
  delete: (id: string) => Promise<void>;
}
