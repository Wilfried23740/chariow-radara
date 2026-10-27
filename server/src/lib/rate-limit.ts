import { getConnInfo } from '@hono/node-server/conninfo';
import type { Context, MiddlewareHandler } from 'hono';
import { env } from '../env.js';

interface Options {
  /** Durée de la fenêtre en secondes. */
  windowSec: number;
  /** Nombre de requêtes autorisées par fenêtre et par visiteur. */
  max: number;
  /** Préfixe pour séparer les compteurs de deux limites différentes. */
  name: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function clientIp(c: Context): string {
  if (env.trustProxy) {
    const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
    if (forwarded) return forwarded;
  }
  return getConnInfo(c).remote.address ?? 'inconnu';
}

/**
 * Limite le nombre de requêtes par visiteur (fenêtre fixe, en mémoire).
 * Suffisant pour une seule instance ; à remplacer par un stockage partagé si l'API passe à plusieurs.
 */
export function rateLimit({ windowSec, max, name }: Options): MiddlewareHandler {
  const buckets = new Map<string, Bucket>();

  // Nettoyage régulier pour que la table ne grossisse pas.
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }, 60_000).unref();

  return async (c, next) => {
    const key = `${name}:${clientIp(c)}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowSec * 1000 };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    const remaining = Math.max(0, max - bucket.count);
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(remaining));

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfter));
      return c.json({ error: 'Trop de requêtes. Réessayez dans un instant.' }, 429);
    }
    await next();
  };
}
