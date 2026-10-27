import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Inbox } from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import type { Product, ProductCategory, ProductMethod } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { ProductCard } from './ProductCard';
import { StatsBar } from './StatsBar';
import { Button } from '@/components/ui/Button';

interface DashboardProps {
  onProductClick: (product: Product) => void;
  onNavigateAdd: () => void;
}

type SortBy = 'traffic' | 'sales' | 'rating' | 'recent';

export function Dashboard({ onProductClick, onNavigateAdd }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [trackedMethods, setTrackedMethods] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('traffic');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const [productList, links] = await Promise.all([
          api.get<Product[]>('/api/products'),
          api.get<ProductMethod[]>('/api/product-methods'),
        ]);
        setProducts(productList);
        setTrackedMethods(new Set(links.map((pm) => pm.method_id)).size);
      } catch (err) {
        console.error('Erreur de chargement:', err);
        setLoadError('Impossible de charger les produits : ' + errorMessage(err));
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.creator.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'traffic':
          return b.traffic_score - a.traffic_score;
        case 'sales':
          return b.sales_estimate - a.sales_estimate;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.spotted_at).getTime() - new Date(a.spotted_at).getTime();
      }
    });
    return result;
  }, [products, search, categoryFilter, sortBy]);

  const categories: (ProductCategory | 'all')[] = [
    'all',
    'ebook',
    'formation',
    'logiciel',
    'template',
    'coaching',
    'bundle',
    'video',
    'design',
    'audio',
    'autre',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-foreground">Classement des produits</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Les meilleurs produits digitaux repérés sur Chariow, classés par trafic généré.
        </p>
      </div>

      {loadError && (
        <div role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
          {loadError}
        </div>
      )}

      <StatsBar products={products} trackedMethods={trackedMethods} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            aria-label="Rechercher un produit"
            placeholder="Rechercher par titre, créateur ou tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-11 pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 [&>select]:min-h-11 [&>select]:flex-1 sm:[&>select]:flex-none">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <select
            aria-label="Filtrer par catégorie"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')}
            className="px-3 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'Toutes catégories' : CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <select
            aria-label="Trier par"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="traffic">Trafic</option>
            <option value="sales">Ventes</option>
            <option value="rating">Note</option>
            <option value="recent">Récent</option>
          </select>
        </div>
      </div>

      {/* Sur mobile : une seule ligne défilante au doigt ; sur grand écran : retour à la ligne. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(categories.slice(1) as ProductCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(categoryFilter === c ? 'all' : c)}
            aria-pressed={categoryFilter === c}
            className={`shrink-0 min-h-10 text-xs px-3.5 py-2 rounded-full border font-medium transition-all ${
              categoryFilter === c
                ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_18px_rgb(var(--primary)/0.3)]'
                : 'bg-card text-muted-foreground border-border hover:border-brand/60 hover:text-foreground'
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
          role="status"
          aria-busy="true"
          aria-label="Chargement des produits"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 flex gap-4 motion-safe:animate-pulse">
              <div className="w-20 h-20 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <Inbox className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">
            {products.length === 0
              ? 'Aucun produit repéré pour le moment.'
              : 'Aucun produit ne correspond à votre recherche.'}
          </p>
          {products.length === 0 && (
            <Button variant="primary" className="mt-4" onClick={onNavigateAdd}>
              Repérer mon premier produit
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="motion-safe:animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
            >
              <ProductCard
                product={product}
                rank={i + 1}
                onClick={() => onProductClick(product)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
