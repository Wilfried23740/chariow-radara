import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './client.js';

await migrate(db, { migrationsFolder: new URL('../../drizzle', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') });
console.log('Migrations appliquées.');
await pool.end();
