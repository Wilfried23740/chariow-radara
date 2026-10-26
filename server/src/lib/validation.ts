import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '../db/schema.js';

// Comme zValidator, mais renvoie { error: "message lisible" } en cas de données invalides.
export const validate = <Target extends keyof ValidationTargets, Schema extends z.ZodType>(
  target: Target,
  schema: Schema,
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(' ; ');
      return c.json({ error: message }, 400);
    }
  });

// Les URL sont affichées dans des liens et des images : seuls http(s) sont acceptés.
const optionalHttpUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === '' || /^https?:\/\//i.test(v), 'URL http(s) attendue');

export const productInput = z.object({
  title: z.string().trim().min(1, 'Le titre est obligatoire').max(200),
  creator: z.string().trim().min(1, 'Le créateur est obligatoire').max(200),
  description: z.string().trim().max(5000).default(''),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.number().min(0).max(1_000_000_000).default(0),
  currency: z.enum(['USD', 'EUR', 'FCFA', 'NGN']).default('USD'),
  image_url: optionalHttpUrl.default(''),
  chariow_url: optionalHttpUrl.default(''),
  traffic_score: z.number().int().min(0).max(100).default(0),
  sales_estimate: z.number().int().min(0).max(1_000_000_000).default(0),
  rating: z.number().min(0).max(5).default(0),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export const productUpdateInput = productInput.partial();

export const methodLinkInput = z.object({
  method_id: z.string().uuid(),
  traffic_contribution: z.number().int().min(0).max(100),
  notes: z.string().trim().max(1000).default(''),
});

export const idParam = z.object({ id: z.string().uuid() });
