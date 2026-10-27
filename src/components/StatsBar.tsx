import { Package, TrendingUp, DollarSign, Target } from 'lucide-react';
import type { Product } from '@/types';

interface StatsBarProps {
  products: Product[];
  trackedMethods: number;
}

export function StatsBar({ products, trackedMethods }: StatsBarProps) {
  const totalProducts = products.length;
  const avgTraffic =
    totalProducts > 0
      ? Math.round(products.reduce((sum, p) => sum + p.traffic_score, 0) / totalProducts)
      : 0;
  const avgPrice =
    totalProducts > 0
      ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / totalProducts)
      : 0;

  const stats = [
    { label: 'Produits repérés', value: totalProducts, icon: Package, color: 'text-foreground', bg: 'bg-muted' },
    { label: 'Trafic moyen', value: `${avgTraffic}/100`, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Prix moyen', value: avgPrice > 0 ? `${avgPrice} $` : '—', icon: DollarSign, color: 'text-brand', bg: 'bg-brand/10' },
    { label: 'Méthodes suivies', value: trackedMethods, icon: Target, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-400/15' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card rounded-[1.375rem] border border-border p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${stat.color}`} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xl font-medium text-foreground leading-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
