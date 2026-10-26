import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/client.js';
import { productMethods, products, salesMethods } from '../db/schema.js';
import { requireUser, type AppEnv } from '../lib/require-user.js';
import { productMethodOut, productOut } from '../lib/serializers.js';
import { idParam, methodLinkInput, productInput, productUpdateInput, validate } from '../lib/validation.js';

export const productRoutes = new Hono<AppEnv>();

// Lecture publique ----------------------------------------------------------

productRoutes.get('/', async (c) => {
  const rows = await db.select().from(products).orderBy(desc(products.trafficScore));
  return c.json(rows.map(productOut));
});

productRoutes.get('/:id/methods', validate('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const rows = await db
    .select({ pm: productMethods, method: salesMethods })
    .from(productMethods)
    .innerJoin(salesMethods, eq(productMethods.methodId, salesMethods.id))
    .where(eq(productMethods.productId, id));
  return c.json(rows.map((r) => productMethodOut(r.pm, r.method)));
});

// Écriture : réservée au propriétaire ------------------------------------------

productRoutes.post('/', requireUser, validate('json', productInput), async (c) => {
  const body = c.req.valid('json');
  const [row] = await db
    .insert(products)
    .values({
      userId: c.get('userId'),
      title: body.title,
      creator: body.creator,
      description: body.description,
      category: body.category,
      price: body.price,
      currency: body.currency,
      imageUrl: body.image_url,
      chariowUrl: body.chariow_url,
      trafficScore: body.traffic_score,
      salesEstimate: body.sales_estimate,
      rating: body.rating,
      tags: body.tags,
    })
    .returning();
  return c.json(productOut(row), 201);
});

async function ownedProduct(productId: string, userId: string) {
  const [row] = await db.select().from(products).where(eq(products.id, productId));
  if (!row) return { error: 'Produit introuvable', status: 404 as const };
  if (row.userId !== userId) return { error: 'Ce produit ne vous appartient pas', status: 403 as const };
  return { row };
}

productRoutes.patch(
  '/:id',
  requireUser,
  validate('param', idParam),
  validate('json', productUpdateInput),
  async (c) => {
    const { id } = c.req.valid('param');
    const check = await ownedProduct(id, c.get('userId'));
    if ('error' in check) return c.json({ error: check.error }, check.status);

    const b = c.req.valid('json');
    const [row] = await db
      .update(products)
      .set({
        ...(b.title !== undefined && { title: b.title }),
        ...(b.creator !== undefined && { creator: b.creator }),
        ...(b.description !== undefined && { description: b.description }),
        ...(b.category !== undefined && { category: b.category }),
        ...(b.price !== undefined && { price: b.price }),
        ...(b.currency !== undefined && { currency: b.currency }),
        ...(b.image_url !== undefined && { imageUrl: b.image_url }),
        ...(b.chariow_url !== undefined && { chariowUrl: b.chariow_url }),
        ...(b.traffic_score !== undefined && { trafficScore: b.traffic_score }),
        ...(b.sales_estimate !== undefined && { salesEstimate: b.sales_estimate }),
        ...(b.rating !== undefined && { rating: b.rating }),
        ...(b.tags !== undefined && { tags: b.tags }),
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, id), eq(products.userId, c.get('userId'))))
      .returning();
    return c.json(productOut(row));
  },
);

productRoutes.delete('/:id', requireUser, validate('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const check = await ownedProduct(id, c.get('userId'));
  if ('error' in check) return c.json({ error: check.error }, check.status);
  await db.delete(products).where(and(eq(products.id, id), eq(products.userId, c.get('userId'))));
  return c.body(null, 204);
});

productRoutes.post(
  '/:id/methods',
  requireUser,
  validate('param', idParam),
  validate('json', methodLinkInput),
  async (c) => {
    const { id } = c.req.valid('param');
    const check = await ownedProduct(id, c.get('userId'));
    if ('error' in check) return c.json({ error: check.error }, check.status);

    const body = c.req.valid('json');
    const [method] = await db.select().from(salesMethods).where(eq(salesMethods.id, body.method_id));
    if (!method) return c.json({ error: 'Méthode de vente introuvable' }, 404);

    const [existing] = await db
      .select({ id: productMethods.id })
      .from(productMethods)
      .where(and(eq(productMethods.productId, id), eq(productMethods.methodId, body.method_id)));
    if (existing) return c.json({ error: 'Cette méthode est déjà associée au produit' }, 409);

    const [pm] = await db
      .insert(productMethods)
      .values({
        productId: id,
        methodId: body.method_id,
        trafficContribution: body.traffic_contribution,
        notes: body.notes,
      })
      .returning();
    return c.json(productMethodOut(pm, method), 201);
  },
);
