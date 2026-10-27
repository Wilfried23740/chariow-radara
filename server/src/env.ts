import { config } from 'dotenv';

// En local, le .env est à la racine du dépôt, partagé avec le site.
// En production (Render…), les variables viennent de l'hébergeur : le fichier est absent, sans erreur.
config({ path: new URL('../../.env', import.meta.url) });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} est manquante (fichier .env ou variables de l'hébergeur)`);
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

const isProduction = process.env.NODE_ENV === 'production';

export const env = {
  isProduction,
  databaseUrl: required('DATABASE_URL'),
  authSecret: required('BETTER_AUTH_SECRET'),
  authUrl: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  // Plusieurs origines possibles, séparées par des virgules.
  frontendOrigins: (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean),
  port: Number(process.env.PORT ?? 3001),
  // Derrière le proxy de l'hébergeur, l'adresse du visiteur est dans X-Forwarded-For.
  trustProxy: process.env.TRUST_PROXY ? process.env.TRUST_PROXY === 'true' : isProduction,
  // Envoi d'emails (confirmation d'inscription) : désactivé tant que la clé est absente.
  resendApiKey: optional('RESEND_API_KEY'),
  emailFrom: optional('EMAIL_FROM') ?? 'Chariow Radar <onboarding@resend.dev>',
  // Anti-robots Cloudflare Turnstile : désactivé tant que la clé secrète est absente.
  turnstileSecret: optional('TURNSTILE_SECRET_KEY'),
};

if (isProduction) {
  if (env.authSecret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET doit faire au moins 32 caractères en production');
  }
  if (!env.authUrl.startsWith('https://')) {
    throw new Error('BETTER_AUTH_URL doit commencer par https:// en production');
  }
}
