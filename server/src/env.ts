import { config } from 'dotenv';

// Le .env est à la racine du dépôt, partagé avec le site.
config({ path: new URL('../../.env', import.meta.url) });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} est manquante dans le fichier .env`);
  return value;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  authSecret: required('BETTER_AUTH_SECRET'),
  authUrl: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  port: Number(process.env.PORT ?? 3001),
};
