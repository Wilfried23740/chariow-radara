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
    { label: 'Prix moyen', value: avgPrice > 0 ? `${avgPrice} $` : '—', icon: DollarSign, color: 'text-primary dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Méthodes suivies', value: trackedMethods, icon: Target, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground leading-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
