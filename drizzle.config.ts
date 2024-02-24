import type { Config } from 'drizzle-kit'
import { env } from './src/config/env'

export default {
  schema: './src/db/schema/index.ts',
  out: '/src/db/migrations',
  driver: 'mysql2',
  dbCredentials: {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  }
} satisfies Config