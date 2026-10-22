import { Package, TrendingUp, DollarSign, Target } from 'lucide-react';
import type { Product, SalesMethod } from '@/types';

interface StatsBarProps {
  products: Product[];
  methods: SalesMethod[];
}

export function StatsBar({ products, methods }: StatsBarProps) {
  const totalProducts = products.length;
  const avgTraffic =
    totalProducts > 0
      ? Math.round(products.reduce((sum, p) => sum + p.traffic_score, 0) / totalProducts)
      : 0;
  const avgPrice =
    totalProducts > 0
      ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / totalProducts)
      : 0;
  const topMethods = methods.length;

  const stats = [
    { label: 'Produits repérés', value: totalProducts, icon: Package, color: 'text-slate-700', bg: 'bg-slate-50' },
    { label: 'Trafic moyen', value: `${avgTraffic}/100`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Prix moyen', value: avgPrice > 0 ? `${avgPrice} $` : '—', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Méthodes suivies', value: topMethods, icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900 leading-tight">{stat.value}</p>
              <p className="text-xs text-slate-500 truncate">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
