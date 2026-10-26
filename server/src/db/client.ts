import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env.js';
import * as authSchema from './auth-schema.js';
import * as appSchema from './schema.js';

export const schema = { ...authSchema, ...appSchema };

export const pool = new Pool({ connectionString: env.databaseUrl });
export const db = drizzle(pool, { schema });
