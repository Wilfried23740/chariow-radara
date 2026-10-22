import { useEffect, useState, useMemo } from 'react';
import { Loader2, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ProductMethod, SalesMethod, MethodCategory } from '@/types';
import { METHOD_CATEGORY_LABELS, METHOD_CATEGORY_COLORS } from '@/types';
import { getMethodIcon } from '@/lib/methodIcons';

interface MethodStat {
  method: SalesMethod;
  productCount: number;
  totalContribution: number;
  avgContribution: number;
}

export function Insights() {
  const [productMethods, setProductMethods] = useState<ProductMethod[]>([]);
  const [methods, setMethods] = useState<SalesMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: pmData }, { data: methodsData }] = await Promise.all([
        supabase.from('product_methods').select('*, method:sales_methods(*)'),
        supabase.from('sales_methods').select('*').order('name'),
      ]);
      setProductMethods((pmData as ProductMethod[]) ?? []);
      setMethods(methodsData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const methodStats: MethodStat[] = useMemo(() => {
    return methods
      .map((method) => {
        const linked = productMethods.filter((pm) => pm.method_id === method.id);
        const totalContribution = linked.reduce(
          (sum, pm) => sum + pm.traffic_contribution,
          0,
        );
        return {
          method,
          productCount: linked.length,
          totalContribution,
          avgContribution:
            linked.length > 0 ? Math.round(totalContribution / linked.length) : 0,
        };
      })
      .filter((s) => s.productCount > 0)
      .sort((a, b) => b.totalContribution - a.totalContribution);
  }, [productMethods, methods]);

  const maxContribution = Math.max(...methodStats.map((s) => s.totalContribution), 1);

  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const pm of productMethods) {
      const method = pm.method as unknown as SalesMethod;
      if (!method) continue;
      const cat = method.category;
      if (!map[cat]) map[cat] = { count: 0, total: 0 };
      map[cat].count += 1;
      map[cat].total += pm.traffic_contribution;
    }
    return Object.entries(map)
      .map(([cat, val]) => ({
        category: cat as MethodCategory,
        ...val,
        avg: val.count > 0 ? Math.round(val.total / val.count) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [productMethods]);

  const topMethod = methodStats[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Analyses des méthodes de vente</h2>
        <p className="text-sm text-slate-500 mt-1">
          Découvrez quelles stratégies marketing génèrent le plus de trafic sur les produits repérés.
        </p>
      </div>

      {productMethods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <BarChart3 className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Aucune donnée d'analyse disponible.</p>
          <p className="text-sm text-slate-400 mt-1">
            Ajoutez des méthodes de vente aux produits pour voir les analyses.
          </p>
        </div>
      ) : (
        <>
          {topMethod && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-amber-300" />
                <span className="text-sm text-slate-300">Méthode la plus performante</span>
              </div>
              <h3 className="text-2xl font-bold">{topMethod.method.name}</h3>
              <p className="text-sm text-slate-300 mt-1">
                {topMethod.method.description}
              </p>
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-3xl font-bold">{topMethod.totalContribution}</p>
                  <p className="text-xs text-slate-400">Contribution totale au trafic</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{topMethod.productCount}</p>
                  <p className="text-xs text-slate-400">Produits utilisant cette méthode</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{topMethod.avgContribution}%</p>
                  <p className="text-xs text-slate-400">Contribution moyenne</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Classement des méthodes</h3>
            <div className="space-y-2">
              {methodStats.map((stat, i) => {
                const Icon = getMethodIcon(stat.method.icon);
                const widthPercent = (stat.totalContribution / maxContribution) * 100;
                return (
                  <div
                    key={stat.method.id}
                    className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {i + 1}
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-900">
                          {stat.method.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${METHOD_CATEGORY_COLORS[stat.method.category as MethodCategory]}`}
                        >
                          {METHOD_CATEGORY_LABELS[stat.method.category as MethodCategory]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 shrink-0">
                          {stat.productCount} produit{stat.productCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-slate-900">
                        {stat.totalContribution}
                      </p>
                      <p className="text-xs text-slate-400">points trafic</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {categoryStats.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Performance par type de méthode</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categoryStats.map((cat) => (
                  <div
                    key={cat.category}
                    className="bg-white rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${METHOD_CATEGORY_COLORS[cat.category]}`}
                      >
                        {METHOD_CATEGORY_LABELS[cat.category]}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{cat.total}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {cat.count} méthode{cat.count > 1 ? 's' : ''} · {cat.avg}% en moyenne
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
