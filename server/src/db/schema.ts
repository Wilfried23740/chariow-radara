import { sql } from 'drizzle-orm';
import {
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const PRODUCT_CATEGORIES = [
  'ebook',
  'formation',
  'logiciel',
  'template',
  'coaching',
  'bundle',
  'audio',
  'video',
  'design',
  'autre',
] as const;

export const METHOD_CATEGORIES = [
  'paid',
  'organic',
  'email',
  'partnership',
  'webinar',
  'affiliate',
  'social',
] as const;

const quoted = (values: readonly string[]) => sql.raw(values.map((v) => `'${v}'`).join(', '));

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Propriétaire du produit.
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    creator: text('creator').notNull(),
    description: text('description').notNull().default(''),
    category: text('category').notNull(),
    price: doublePrecision('price').notNull().default(0),
    currency: text('currency').notNull().default('USD'),
    imageUrl: text('image_url').notNull().default(''),
    chariowUrl: text('chariow_url').notNull().default(''),
    trafficScore: integer('traffic_score').notNull().default(0),
    salesEstimate: integer('sales_estimate').notNull().default(0),
    rating: doublePrecision('rating').notNull().default(0),
    tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
    spottedAt: timestamp('spotted_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('products_category_check', sql`${t.category} IN (${quoted(PRODUCT_CATEGORIES)})`),
    check('products_traffic_score_check', sql`${t.trafficScore} BETWEEN 0 AND 100`),
    check('products_rating_check', sql`${t.rating} BETWEEN 0 AND 5`),
    index('idx_products_traffic_score').on(t.trafficScore.desc()),
    index('idx_products_category').on(t.category),
    index('idx_products_spotted_at').on(t.spottedAt.desc()),
    index('idx_products_user_id').on(t.userId),
  ],
);

export const salesMethods = pgTable(
  'sales_methods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    category: text('category').notNull(),
    icon: text('icon').notNull().default('TrendingUp'),
    description: text('description').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check('sales_methods_category_check', sql`${t.category} IN (${quoted(METHOD_CATEGORIES)})`)],
);

export const productMethods = pgTable(
  'product_methods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    methodId: uuid('method_id')
      .notNull()
      .references(() => salesMethods.id, { onDelete: 'cascade' }),
    trafficContribution: integer('traffic_contribution').notNull().default(0),
    notes: text('notes').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('product_methods_product_id_method_id_unique').on(t.productId, t.methodId),
    check('product_methods_contribution_check', sql`${t.trafficContribution} BETWEEN 0 AND 100`),
    index('idx_pm_product_id').on(t.productId),
    index('idx_pm_method_id').on(t.methodId),
  ],
);
