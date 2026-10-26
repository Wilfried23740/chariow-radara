import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { env } from './env.js';
import { db, schema } from './db/client.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  secret: env.authSecret,
  baseURL: env.authUrl,
  trustedOrigins: [env.frontendUrl],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // À activer avec un service d'envoi d'emails avant la mise en ligne.
    requireEmailVerification: false,
  },
});
