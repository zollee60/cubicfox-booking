import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '../config/env';

export const createDbConnection = async () => {
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });

  const db = drizzle(connection, { schema, mode: 'default' });

  return { db, connection };
};
