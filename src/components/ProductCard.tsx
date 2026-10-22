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
      ? 'text-emerald-600'
      : product.traffic_score >= 40
        ? 'text-amber-600'
        : 'text-slate-400';

  const rankBadge =
    rank === 1
      ? 'bg-amber-400 text-white'
      : rank === 2
        ? 'bg-slate-300 text-slate-700'
        : rank === 3
          ? 'bg-orange-400 text-white'
          : 'bg-slate-100 text-slate-500';

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex gap-4 p-4">
        <div className="relative shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-20 h-20 rounded-xl object-cover bg-slate-100"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Tag className="w-7 h-7 text-slate-400" />
            </div>
          )}
          <div
            className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full ${rankBadge} flex items-center justify-center text-xs font-bold shadow-sm`}
          >
            {rank}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-slate-700 line-clamp-2">
              {product.title}
            </h3>
            {product.chariow_url && (
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">par {product.creator}</p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[product.category]}`}
            >
              {CATEGORY_LABELS[product.category]}
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {product.price > 0
                ? `${product.price.toLocaleString('fr-FR')} ${product.currency}`
                : 'Gratuit'}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2.5 text-xs">
            <span className={`flex items-center gap-1 font-medium ${trafficColor}`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {product.traffic_score}/100
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Eye className="w-3.5 h-3.5" />
              {product.sales_estimate.toLocaleString('fr-FR')}
            </span>
            {product.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-slate-100">
        <div
          className={`h-full transition-all ${
            product.traffic_score >= 70
              ? 'bg-emerald-500'
              : product.traffic_score >= 40
                ? 'bg-amber-500'
                : 'bg-slate-300'
          }`}
          style={{ width: `${product.traffic_score}%` }}
        />
      </div>
    </button>
  );
}
