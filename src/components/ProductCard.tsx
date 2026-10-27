import { TrendingUp, Star, Eye, Tag, ExternalLink } from 'lucide-react';
import type { Product } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';

interface ProductCardProps {
  product: Product;
  rank: number;
  onClick: () => void;
}

export function ProductCard({ product, rank, onClick }: ProductCardProps) {
  const trafficColor =
    product.traffic_score >= 70
      ? 'text-accent'
      : product.traffic_score >= 40
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-muted-foreground';

  const rankBadge =
    rank === 1
      ? 'bg-primary text-primary-foreground shadow-[0_0_14px_rgb(var(--primary)/0.6)]'
      : rank === 2
        ? 'bg-brand text-background'
        : rank === 3
          ? 'bg-amber-400 text-amber-950'
          : 'bg-muted text-muted-foreground';

  return (
    <button
      onClick={onClick}
      className="group h-full w-full text-left bg-card rounded-[1.375rem] border border-border overflow-hidden hover:border-brand/60 hover:shadow-[0_12px_40px_-16px_rgb(var(--brand)/0.5)] transition-all duration-200 motion-safe:hover:-translate-y-0.5"
    >
      <div className="flex gap-4 p-4">
        <div className="relative shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-20 h-20 rounded-xl object-cover bg-muted"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-muted to-border flex items-center justify-center">
              <Tag className="w-7 h-7 text-muted-foreground" />
            </div>
          )}
          <div
            className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full ${rankBadge} flex items-center justify-center font-mono text-xs font-bold`}
          >
            {rank}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-foreground/80 line-clamp-2">
              {product.title}
            </h3>
            {product.chariow_url && (
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-muted-foreground shrink-0 mt-0.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">par {product.creator}</p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[product.category]}`}
            >
              {CATEGORY_LABELS[product.category]}
            </span>
            <span className="text-xs font-semibold text-foreground/80">
              {product.price > 0
                ? `${product.price.toLocaleString('fr-FR')} ${product.currency}`
                : 'Gratuit'}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2.5 text-xs font-mono">
            <span className={`flex items-center gap-1 font-medium ${trafficColor}`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {product.traffic_score}/100
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              {product.sales_estimate.toLocaleString('fr-FR')}
            </span>
            {product.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-border">
        <div
          className={`h-full transition-all ${
            product.traffic_score >= 70
              ? 'bg-gradient-to-r from-brand to-accent'
              : product.traffic_score >= 40
                ? 'bg-amber-400'
                : 'bg-muted-foreground/40'
          }`}
          style={{ width: `${product.traffic_score}%` }}
        />
      </div>
    </button>
  );
}
