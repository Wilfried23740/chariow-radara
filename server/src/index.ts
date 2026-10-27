import { serve } from '@hono/node-server';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { auth } from './auth.js';
import { db } from './db/client.js';
import { env } from './env.js';
import { rateLimit } from './lib/rate-limit.js';
import { methodRoutes, productMethodRoutes } from './routes/methods.js';
import { productRoutes } from './routes/products.js';

const app = new Hono();

app.use('*', secureHeaders());

// CORS en premier : même les réponses d'erreur (429…) restent lisibles par le site.
app.use(
  '/api/*',
  cors({
    origin: env.frontendOrigins,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'x-captcha-response'],
  }),
);

// Limites par visiteur : lecture généreuse, écriture plus serrée (l'auth a ses propres règles).
const readLimit = rateLimit({ name: 'lecture', windowSec: 60, max: 240 });
const writeLimit = rateLimit({ name: 'ecriture', windowSec: 60, max: 40 });
app.use('/api/*', async (c, next) => {
  if (c.req.path.startsWith('/api/auth/') || c.req.path === '/api/health') return next();
  const isRead = ['GET', 'HEAD', 'OPTIONS'].includes(c.req.method);
  return (isRead ? readLimit : writeLimit)(c, next);
});
app.use('/api/*', bodyLimit({ maxSize: 100 * 1024, onError: (c) => c.json({ error: 'Requête trop volumineuse' }, 413) }));

app.get('/api/health', async (c) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Health check: base injoignable', err);
    return c.json({ status: 'error', database: 'unreachable' }, 503);
  }
});

// Better Auth gère /api/auth/sign-up/email, /sign-in/email, /sign-out, /get-session…
app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.route('/api/products', productRoutes);
app.route('/api/methods', methodRoutes);
app.route('/api/product-methods', productMethodRoutes);

app.notFound((c) => c.json({ error: 'Route introuvable' }, 404));
app.onError((err, c) => {
  console.error('Erreur serveur', err);
  return c.json({ error: 'Erreur interne du serveur' }, 500);
});

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`API Chariow Radar sur http://localhost:${info.port}`);
});
