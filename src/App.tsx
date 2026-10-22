import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ProductDetail } from '@/components/ProductDetail';
import { AddProductForm } from '@/components/AddProductForm';
import { Insights } from '@/components/Insights';
import type { Product } from '@/types';

type View = 'dashboard' | 'add' | 'insights' | 'detail';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = useCallback((v: 'dashboard' | 'add' | 'insights') => {
    setView(v);
  }, []);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedProduct(null);
    setView('dashboard');
  }, []);

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setView('dashboard');
  }, []);

  const handleDeleted = useCallback(() => {
    setSelectedProduct(null);
    setRefreshKey((k) => k + 1);
    setView('dashboard');
  }, []);

  const headerView: 'dashboard' | 'add' | 'insights' =
    view === 'detail' ? 'dashboard' : (view as 'dashboard' | 'add' | 'insights');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header view={headerView} onNavigate={handleNavigate} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {view === 'dashboard' && (
          <Dashboard
            key={refreshKey}
            onProductClick={handleProductClick}
            onNavigateAdd={() => setView('add')}
          />
        )}
        {view === 'detail' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={handleBack}
            onDelete={handleDeleted}
          />
        )}
        {view === 'add' && (
          <AddProductForm onSaved={handleSaved} onCancel={() => setView('dashboard')} />
        )}
        {view === 'insights' && <Insights />}
      </main>
    </div>
  );
}

export default App;
