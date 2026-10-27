import { useEffect, useState, useMemo } from 'react';
import { Loader2, Award, BarChart3 } from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
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
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [links, catalog] = await Promise.all([
          api.get<ProductMethod[]>('/api/product-methods'),
          api.get<SalesMethod[]>('/api/methods'),
        ]);
        setProductMethods(links);
        setMethods(catalog);
      } catch (err) {
        console.error('Erreur de chargement:', err);
        setLoadError('Impossible de charger les analyses : ' + errorMessage(err));
      }
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
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-foreground">Analyses des méthodes de vente</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Découvrez quelles stratégies marketing génèrent le plus de trafic sur les produits repérés.
        </p>
      </div>

      {loadError && (
        <div role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
          {loadError}
        </div>
      )}

      {productMethods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <BarChart3 className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Aucune donnée d'analyse disponible.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoutez des méthodes de vente aux produits pour voir les analyses.
          </p>
        </div>
      ) : (
        <>
          {topMethod && (
            <div className="relative overflow-hidden bg-card border border-border rounded-[1.375rem] p-6">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_100%_at_100%_0%,rgb(var(--brand)/0.25),transparent_70%)]"
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-primary">Méthode la plus performante</span>
                </div>
                <h3 className="font-display text-3xl text-foreground">{topMethod.method.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {topMethod.method.description}
                </p>
                <div className="flex flex-wrap gap-x-10 gap-y-4 mt-5">
                  <div>
                    <p className="font-mono text-3xl text-foreground">{topMethod.totalContribution}</p>
                    <p className="text-xs text-muted-foreground">Contribution totale au trafic</p>
                  </div>
                  <div>
                    <p className="font-mono text-3xl text-foreground">{topMethod.productCount}</p>
                    <p className="text-xs text-muted-foreground">Produits utilisant cette méthode</p>
                  </div>
                  <div>
                    <p className="font-mono text-3xl text-primary">{topMethod.avgContribution}%</p>
                    <p className="text-xs text-muted-foreground">Contribution moyenne</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-foreground mb-3">Classement des méthodes</h3>
            <div className="space-y-2">
              {methodStats.map((stat, i) => {
                const Icon = getMethodIcon(stat.method.icon);
                const widthPercent = (stat.totalContribution / maxContribution) * 100;
                return (
                  <div
                    key={stat.method.id}
                    className="flex items-center gap-3 bg-card rounded-xl border border-border p-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {i + 1}
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {stat.method.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${METHOD_CATEGORY_COLORS[stat.method.category as MethodCategory]}`}
                        >
                          {METHOD_CATEGORY_LABELS[stat.method.category as MethodCategory]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand to-accent rounded-full transition-all"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {stat.productCount} produit{stat.productCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-lg text-foreground">
                        {stat.totalContribution}
                      </p>
                      <p className="text-xs text-muted-foreground">points trafic</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {categoryStats.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Performance par type de méthode</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categoryStats.map((cat) => (
                  <div
                    key={cat.category}
                    className="bg-card rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${METHOD_CATEGORY_COLORS[cat.category]}`}
                      >
                        {METHOD_CATEGORY_LABELS[cat.category]}
                      </span>
                    </div>
                    <p className="font-mono text-2xl text-foreground">{cat.total}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
