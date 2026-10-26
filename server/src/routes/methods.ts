import { and, asc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/client.js';
import { productMethods, products, salesMethods } from '../db/schema.js';
import { requireUser, type AppEnv } from '../lib/require-user.js';
import { methodOut, productMethodOut } from '../lib/serializers.js';
import { idParam, validate } from '../lib/validation.js';

// Catalogue des méthodes de vente (lecture seule).
export const methodRoutes = new Hono<AppEnv>();

methodRoutes.get('/', async (c) => {
  const rows = await db.select().from(salesMethods).orderBy(asc(salesMethods.name));
  return c.json(rows.map(methodOut));
});

// Associations produit <-> méthode.
export const productMethodRoutes = new Hono<AppEnv>();

// Toutes les associations, avec leur méthode (page Analyses et compteur du classement).
productMethodRoutes.get('/', async (c) => {
  const rows = await db
    .select({ pm: productMethods, method: salesMethods })
    .from(productMethods)
    .innerJoin(salesMethods, eq(productMethods.methodId, salesMethods.id));
  return c.json(rows.map((r) => productMethodOut(r.pm, r.method)));
});

productMethodRoutes.delete('/:id', requireUser, validate('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const [row] = await db
    .select({ pmId: productMethods.id, ownerId: products.userId })
    .from(productMethods)
    .innerJoin(products, eq(productMethods.productId, products.id))
    .where(eq(productMethods.id, id));
  if (!row) return c.json({ error: 'Association introuvable' }, 404);
  if (row.ownerId !== c.get('userId')) return c.json({ error: 'Ce produit ne vous appartient pas' }, 403);
  await db.delete(productMethods).where(and(eq(productMethods.id, id)));
  return c.body(null, 204);
});
