import type { InferSelectModel } from 'drizzle-orm';
import type { productMethods, products, salesMethods } from '../db/schema.js';

// Les réponses de l'API gardent les noms de champs en snake_case,
// identiques aux types déjà utilisés par le site (src/types).

export function productOut(p: InferSelectModel<typeof products>) {
  return {
    id: p.id,
    user_id: p.userId,
    title: p.title,
    creator: p.creator,
    description: p.description,
    category: p.category,
    price: p.price,
    currency: p.currency,
    image_url: p.imageUrl,
    chariow_url: p.chariowUrl,
    traffic_score: p.trafficScore,
    sales_estimate: p.salesEstimate,
    rating: p.rating,
    tags: p.tags,
    spotted_at: p.spottedAt,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export function methodOut(m: InferSelectModel<typeof salesMethods>) {
  return {
    id: m.id,
    name: m.name,
    category: m.category,
    icon: m.icon,
    description: m.description,
    created_at: m.createdAt,
  };
}

export function productMethodOut(
  pm: InferSelectModel<typeof productMethods>,
  method?: InferSelectModel<typeof salesMethods>,
) {
  return {
    id: pm.id,
    product_id: pm.productId,
    method_id: pm.methodId,
    traffic_contribution: pm.trafficContribution,
    notes: pm.notes,
    created_at: pm.createdAt,
    ...(method ? { method: methodOut(method) } : {}),
  };
}
