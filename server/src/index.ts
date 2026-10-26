import { serve } from '@hono/node-server';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth.js';
import { db } from './db/client.js';
import { env } from './env.js';
import { methodRoutes, productMethodRoutes } from './routes/methods.js';
import { productRoutes } from './routes/products.js';

const app = new Hono();

app.use(
  '/api/*',
  cors({
    origin: env.frontendUrl,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

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
