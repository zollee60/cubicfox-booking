import { migrate } from 'drizzle-orm/mysql2/migrator';
import { createDbConnection } from 'src/db/db';

(async () => {
  const { db, connection } = await createDbConnection();
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  await connection.end();
})();
