import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Loader2, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, ProductCategory } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { ProductCard } from './ProductCard';
import { StatsBar } from './StatsBar';

interface DashboardProps {
  onProductClick: (product: Product) => void;
  onNavigateAdd: () => void;
}

type SortBy = 'traffic' | 'sales' | 'rating' | 'recent';

export function Dashboard({ onProductClick, onNavigateAdd }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('traffic');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('traffic_score', { ascending: false });
      if (error) {
        console.error('Erreur de chargement:', error);
      }
      setProducts(data ?? []);
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
        <h2 className="text-2xl font-bold text-slate-900">Classement des produits</h2>
        <p className="text-sm text-slate-500 mt-1">
          Les meilleurs produits digitaux repérés sur Chariow, classés par trafic généré.
        </p>
      </div>

      <StatsBar products={products} methods={[]} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, créateur ou tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'Toutes catégories' : CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="traffic">Trafic</option>
            <option value="sales">Ventes</option>
            <option value="rating">Note</option>
            <option value="recent">Récent</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.slice(1).map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(categoryFilter === c ? 'all' : c)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
              categoryFilter === c
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Inbox className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">
            {products.length === 0
              ? 'Aucun produit repéré pour le moment.'
              : 'Aucun produit ne correspond à votre recherche.'}
          </p>
          {products.length === 0 && (
            <button
              onClick={onNavigateAdd}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Repérer mon premier produit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              rank={i + 1}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
