import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Star,
  Eye,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import type {
  Product,
  SalesMethod,
  ProductMethod,
  ProductCategory,
  MethodCategory,
} from '@/types';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  METHOD_CATEGORY_LABELS,
  METHOD_CATEGORY_COLORS,
} from '@/types';
import { getMethodIcon } from '@/lib/methodIcons';
import { useAuth } from '@/lib/auth';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onDelete: () => void;
}

export function ProductDetail({ product, onBack, onDelete }: ProductDetailProps) {
  const { user } = useAuth();
  const isOwner = !!user && product.user_id === user.id;
  const [methods, setMethods] = useState<ProductMethod[]>([]);
  const [allMethods, setAllMethods] = useState<SalesMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [contribution, setContribution] = useState(50);
  const [notes, setNotes] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: product.title,
    creator: product.creator,
    description: product.description,
    category: product.category,
    price: product.price,
    traffic_score: product.traffic_score,
    sales_estimate: product.sales_estimate,
    rating: product.rating,
  });

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const [linked, catalog] = await Promise.all([
        api.get<ProductMethod[]>(`/api/products/${product.id}/methods`),
        api.get<SalesMethod[]>('/api/methods'),
      ]);
      setMethods(linked);
      setAllMethods(catalog);
    } catch (err) {
      setError('Impossible de charger les méthodes de vente : ' + errorMessage(err));
    }
    setLoading(false);
  }, [product.id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const availableMethods = allMethods.filter(
    (m) => !methods.some((pm) => pm.method_id === m.id),
  );

  async function handleAddMethod() {
    if (!selectedMethodId) return;
    setError('');
    try {
      const created = await api.post<ProductMethod>(`/api/products/${product.id}/methods`, {
        method_id: selectedMethodId,
        traffic_contribution: contribution,
        notes,
      });
      setMethods((prev) => [...prev, created]);
    } catch (err) {
      setError('Impossible d\'ajouter la méthode : ' + errorMessage(err));
      return;
    }
    setSelectedMethodId('');
    setContribution(50);
    setNotes('');
    setShowAddMethod(false);
  }

  async function handleRemoveMethod(id: string) {
    setError('');
    try {
      await api.delete(`/api/product-methods/${id}`);
    } catch (err) {
      setError('Impossible de retirer la méthode : ' + errorMessage(err));
      return;
    }
    setMethods((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleSaveEdit() {
    setError('');
    try {
      await api.patch(`/api/products/${product.id}`, {
        title: editForm.title,
        creator: editForm.creator,
        description: editForm.description,
        category: editForm.category,
        price: editForm.price,
        traffic_score: editForm.traffic_score,
        sales_estimate: editForm.sales_estimate,
        rating: editForm.rating,
      });
    } catch (err) {
      setError('Impossible d\'enregistrer les modifications : ' + errorMessage(err));
      return;
    }
    product.title = editForm.title;
    product.creator = editForm.creator;
    product.description = editForm.description;
    product.category = editForm.category as ProductCategory;
    product.price = editForm.price;
    product.traffic_score = editForm.traffic_score;
    product.sales_estimate = editForm.sales_estimate;
    product.rating = editForm.rating;
    setEditing(false);
  }

  async function handleDelete() {
    setError('');
    try {
      await api.delete(`/api/products/${product.id}`);
    } catch (err) {
      setError('Impossible de supprimer le produit : ' + errorMessage(err));
      return;
    }
    onDelete();
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au classement
      </button>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-5 p-5">
          <div className="shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full sm:w-32 h-32 rounded-xl object-cover bg-muted"
              />
            ) : (
              <div className="w-full sm:w-32 h-32 rounded-xl bg-gradient-to-br from-muted to-border flex items-center justify-center">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full text-xl font-bold text-foreground border border-input rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  value={editForm.creator}
                  onChange={(e) => setEditForm({ ...editForm, creator: e.target.value })}
                  className="w-full text-sm text-muted-foreground border border-input rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full text-sm text-muted-foreground border border-input rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Description du produit"
                />
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-muted-foreground">
                    Catégorie
                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value as ProductCategory })
                      }
                      className="mt-1 w-full text-sm border border-input rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Prix ($)
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })
                      }
                      className="mt-1 w-full text-sm border border-input rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Score de trafic (0-100)
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.traffic_score}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          traffic_score: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1 w-full text-sm border border-input rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Ventes estimées
                    <input
                      type="number"
                      value={editForm.sales_estimate}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          sales_estimate: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1 w-full text-sm border border-input rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Note (0-5)
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={editForm.rating}
                      onChange={(e) =>
                        setEditForm({ ...editForm, rating: parseFloat(e.target.value) || 0 })
                      }
                      className="mt-1 w-full text-sm border border-input rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:bg-muted"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl text-foreground">{product.title}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">par {product.creator}</p>
                  </div>
                  {isOwner && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditing(true)}
                        className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-xs font-medium hover:bg-muted"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_COLORS[product.category]}`}
                  >
                    {CATEGORY_LABELS[product.category]}
                  </span>
                  <span className="text-sm font-semibold text-foreground/80">
                    {product.price > 0
                      ? `${product.price.toLocaleString('fr-FR')} ${product.currency}`
                      : 'Gratuit'}
                  </span>
                  {product.chariow_url && (
                    <a
                      href={product.chariow_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Voir sur Chariow
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1.5 text-accent font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {product.traffic_score}/100 trafic
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    {product.sales_estimate.toLocaleString('fr-FR')} ventes
                  </span>
                  {product.rating > 0 && (
                    <span className="flex items-center gap-1.5 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400" />
                      {product.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="border-t border-border/60 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">
              Méthodes de vente ({methods.length})
            </h3>
            {isOwner && !showAddMethod && availableMethods.length > 0 && (
              <button
                onClick={() => setShowAddMethod(true)}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </button>
            )}
          </div>

          {showAddMethod && (
            <div className="mb-4 p-4 rounded-xl border border-border bg-background space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Méthode de vente</label>
                <select
                  value={selectedMethodId}
                  onChange={(e) => setSelectedMethodId(e.target.value)}
                  className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">— Choisir —</option>
                  {availableMethods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Contribution au trafic : {contribution}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={contribution}
                  onChange={(e) => setContribution(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optionnel)"
                className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddMethod}
                  disabled={!selectedMethodId}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddMethod(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:bg-card"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          ) : methods.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucune méthode de vente enregistrée pour ce produit.
            </p>
          ) : (
            <div className="space-y-2">
              {[...methods]
                .sort((a, b) => b.traffic_contribution - a.traffic_contribution)
                .map((pm) => {
                  const method = pm.method as unknown as SalesMethod;
                  if (!method) return null;
                  const Icon = getMethodIcon(method.icon);
                  return (
                    <div
                      key={pm.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-border transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{method.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${METHOD_CATEGORY_COLORS[method.category as MethodCategory]}`}
                          >
                            {METHOD_CATEGORY_LABELS[method.category as MethodCategory]}
                          </span>
                        </div>
                        {pm.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{pm.notes}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full"
                              style={{ width: `${pm.traffic_contribution}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground/80 w-10">
                            {pm.traffic_contribution}%
                          </span>
                        </div>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveMethod(pm.id)}
                          className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Package({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
