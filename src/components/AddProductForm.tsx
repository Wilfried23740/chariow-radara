import { useState } from 'react';
import { Tag, Save, X, Loader2 } from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import type { ProductCategory } from '@/types';
import { CATEGORY_LABELS } from '@/types';

interface AddProductFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

export function AddProductForm({ onSaved, onCancel }: AddProductFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    creator: '',
    description: '',
    category: 'ebook' as ProductCategory,
    price: 0,
    currency: 'USD',
    image_url: '',
    chariow_url: '',
    traffic_score: 50,
    sales_estimate: 0,
    rating: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.creator.trim()) {
      setError('Le titre et le créateur sont obligatoires.');
      return;
    }
    setSaving(true);
    setError('');
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await api.post('/api/products', {
        title: form.title.trim(),
        creator: form.creator.trim(),
        description: form.description.trim(),
        category: form.category,
        price: form.price,
        currency: form.currency,
        image_url: form.image_url.trim(),
        chariow_url: form.chariow_url.trim(),
        traffic_score: form.traffic_score,
        sales_estimate: form.sales_estimate,
        rating: form.rating,
        tags,
      });
    } catch (err) {
      setSaving(false);
      setError('Erreur lors de l\'enregistrement : ' + errorMessage(err));
      return;
    }
    setSaving(false);
    onSaved();
  }

  const inputClass =
    'w-full text-sm border border-input rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-foreground">Repérer un produit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ajoutez un produit digital repéré sur Chariow pour suivre sa performance et ses méthodes de vente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border/60">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-muted to-border flex items-center justify-center">
            <Tag className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Informations du produit</h3>
            <p className="text-xs text-muted-foreground">Renseignez les détails visibles sur Chariow</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Titre du produit *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Ex: Formation complète en marketing digital"
            />
          </div>
          <div>
            <label className={labelClass}>Créateur / Vendeur *</label>
            <input
              value={form.creator}
              onChange={(e) => setForm({ ...form, creator: e.target.value })}
              className={inputClass}
              placeholder="Ex: NDAKA Academy"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={inputClass}
            placeholder="Que propose ce produit ? Quelle est sa promesse principale ?"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
              className={inputClass}
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Prix</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Devise</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className={inputClass}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="FCFA">FCFA</option>
              <option value="NGN">NGN (₦)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Lien Chariow</label>
            <input
              value={form.chariow_url}
              onChange={(e) => setForm({ ...form, chariow_url: e.target.value })}
              className={inputClass}
              placeholder="https://chariow.com/…"
            />
          </div>
          <div>
            <label className={labelClass}>Image / Aperçu (URL)</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className={inputClass}
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border/60">
          <h3 className="font-semibold text-foreground text-sm mb-4">Indicateurs de performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                Score de trafic : {form.traffic_score}/100
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.traffic_score}
                onChange={(e) => setForm({ ...form, traffic_score: parseInt(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className={labelClass}>Ventes estimées</label>
              <input
                type="number"
                min="0"
                value={form.sales_estimate}
                onChange={(e) =>
                  setForm({ ...form, sales_estimate: parseInt(e.target.value) || 0 })
                }
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelClass}>Note (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Tags (séparés par des virgules)</label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className={inputClass}
            placeholder="marketing, afrique, debutant"
          />
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
