import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { captcha } from 'better-auth/plugins';
import { env } from './env.js';
import { db, schema } from './db/client.js';
import { sendVerificationEmail } from './lib/email.js';

// La confirmation d'email n'est exigée que si un service d'envoi est configuré.
const emailEnabled = Boolean(env.resendApiKey);
if (env.isProduction && !emailEnabled) {
  console.warn('RESEND_API_KEY absente : les inscriptions ne seront pas confirmées par email.');
}
if (env.isProduction && !env.turnstileSecret) {
  console.warn('TURNSTILE_SECRET_KEY absente : pas de protection anti-robots à l\'inscription.');
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  secret: env.authSecret,
  baseURL: env.authUrl,
  trustedOrigins: env.frontendOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: emailEnabled,
  },
  emailVerification: {
    sendOnSignUp: emailEnabled,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Sans attendre la réponse, pour ne pas ralentir l'inscription.
      void sendVerificationEmail(user.email, user.name, url).catch((err) =>
        console.error('Envoi de l\'email de confirmation impossible', err),
      );
    },
  },
  // Limites propres à l'authentification (actives en production seulement : le dev reste fluide).
  rateLimit: {
    enabled: env.isProduction,
    window: 60,
    max: 60,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 3600, max: 5 },
    },
  },
  advanced: {
    ipAddress: { ipAddressHeaders: env.trustProxy ? ['x-forwarded-for'] : [] },
    useSecureCookies: env.isProduction,
  },
  plugins: env.turnstileSecret
    ? [captcha({ provider: 'cloudflare-turnstile', secretKey: env.turnstileSecret })]
    : [],
});
