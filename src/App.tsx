import { useState, useCallback } from 'react';
import { LogIn } from 'lucide-react';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ProductDetail } from '@/components/ProductDetail';
import { AddProductForm } from '@/components/AddProductForm';
import { Insights } from '@/components/Insights';
import { AuthModal } from '@/components/AuthModal';
import { Landing } from '@/components/Landing';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import type { Product } from '@/types';

type View = 'home' | 'dashboard' | 'add' | 'insights' | 'detail';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);

  const handleNavigate = useCallback((v: 'home' | 'dashboard' | 'add' | 'insights') => {
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setView('detail');
    window.scrollTo({ top: 0 });
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

  const headerView: 'home' | 'dashboard' | 'add' | 'insights' =
    view === 'detail' ? 'dashboard' : view;

  return (
    <div className="min-h-dvh bg-background">
      <Header view={headerView} onNavigate={handleNavigate} onLogin={() => setAuthOpen(true)} />
      {/* Marge basse : laisse la place à la barre d'onglets mobile. */}
      <main className="max-w-7xl 2xl:max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-8">
        {view === 'home' && (
          <Landing
            onExplore={() => setView('dashboard')}
            onAdd={() => setView('add')}
            onInsights={() => setView('insights')}
            onProductClick={handleProductClick}
          />
        )}
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
        {view === 'add' &&
          !authLoading &&
          (user ? (
            <AddProductForm onSaved={handleSaved} onCancel={() => setView('dashboard')} />
          ) : (
            <div className="mx-auto max-w-md rounded-[1.375rem] border border-border bg-card px-6 py-12 text-center">
              <h2 className="font-display text-2xl text-foreground">Connexion requise</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Connectez-vous pour repérer un produit. Le classement reste consultable sans compte.
              </p>
              <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
                <Button variant="ghost" onClick={() => setView('dashboard')}>
                  Voir le classement
                </Button>
                <Button variant="primary" onClick={() => setAuthOpen(true)}>
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Se connecter
                </Button>
              </div>
            </div>
          ))}
        {view === 'insights' && <Insights />}
      </main>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onDone={() => setAuthOpen(false)}
        message={view === 'add' ? 'Connectez-vous pour repérer un produit.' : undefined}
      />
    </div>
  );
}

export default App;
