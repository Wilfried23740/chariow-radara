import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, Layers, Link2, Plus, TrendingUp, Users } from 'lucide-react';
import { api } from '@/lib/api';
import type { Product, ProductMethod } from '@/types';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/Button';

interface LandingProps {
  onExplore: () => void;
  onAdd: () => void;
  onInsights: () => void;
  onProductClick: (product: Product) => void;
}

const METHODS = [
  'Facebook Ads',
  'TikTok',
  'WhatsApp',
  'Email',
  'YouTube',
  'SEO / Blog',
  'Influenceurs',
  'Webinaires',
  'Affiliation',
  'Instagram',
  'Telegram',
  'Google Ads',
];

const STEPS = [
  {
    icon: Link2,
    title: 'Repérez un produit',
    text: 'Ajoutez un produit vu sur Chariow : titre, créateur, prix, lien et vos estimations de trafic et de ventes.',
  },
  {
    icon: Layers,
    title: 'Associez les méthodes de vente',
    text: 'Indiquez ce qui fait venir le monde : publicités, TikTok, email, affiliation… et la part de trafic de chacune.',
  },
  {
    icon: BarChart3,
    title: 'Comparez et décidez',
    text: 'Le classement et les analyses montrent quels produits et quelles méthodes ressortent vraiment.',
  },
];

// Positions des signaux sur le radar (en % du cercle) et leur couleur.
const BLIP_SLOTS = [
  { left: '68%', top: '24%', tone: 'text-primary bg-primary', delay: '0s' },
  { left: '26%', top: '34%', tone: 'text-brand bg-brand', delay: '0.6s' },
  { left: '74%', top: '66%', tone: 'text-amber-500 bg-amber-500', delay: '1.2s' },
  { left: '36%', top: '76%', tone: 'text-primary bg-primary', delay: '1.8s' },
];

// Affiché tant qu'aucun produit réel n'existe : clairement présenté comme un exemple.
const SAMPLE_SIGNALS = [
  { label: 'Formation SEO', score: 87 },
  { label: 'Pack de templates', score: 72 },
  { label: 'E-book vendre en ligne', score: 64 },
  { label: 'Coaching WhatsApp', score: 58 },
];

export function Landing({ onExplore, onAdd, onInsights, onProductClick }: LandingProps) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [links, setLinks] = useState<ProductMethod[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get<Product[]>('/api/products'),
      api.get<ProductMethod[]>('/api/product-methods'),
    ])
      .then(([p, l]) => {
        if (cancelled) return;
        setProducts(p);
        setLinks(l);
      })
      .catch((err) => console.error('Chargement de la page d\'accueil:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!products || !links) return null;
    const avg =
      products.length > 0
        ? Math.round(products.reduce((sum, p) => sum + p.traffic_score, 0) / products.length)
        : 0;
    return {
      products: products.length,
      methods: new Set(links.map((l) => l.method_id)).size,
      avgTraffic: avg,
    };
  }, [products, links]);

  const top = products?.slice(0, 3) ?? [];
  const hasReal = (products?.length ?? 0) > 0;
  const signals = hasReal
    ? products!.slice(0, BLIP_SLOTS.length).map((p) => ({ label: p.title, score: p.traffic_score }))
    : SAMPLE_SIGNALS;

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* Hero */}
      <section aria-labelledby="hero-title" className="grid items-center gap-12 pt-4 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/35 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Veille des produits Chariow
          </p>
          <h1
            id="hero-title"
            className="mt-6 font-display text-5xl leading-[0.98] text-foreground text-balance sm:text-6xl lg:text-7xl"
          >
            Voyez ce qui{' '}
            <span className="bg-gradient-to-r from-brand to-primary bg-clip-text text-transparent">
              se vend
            </span>{' '}
            avant les autres.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Chariow Radar classe les produits numériques et révèle les méthodes de vente qui font
            vraiment venir le trafic. Public, gratuit, sans compte pour explorer.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button variant="primary" size="lg" onClick={onExplore}>
              Explorer le classement
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button size="lg" onClick={onAdd}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Repérer un produit
            </Button>
          </div>
        </div>

        <Radar signals={signals} illustrative={!hasReal} />
      </section>

      {/* Chiffres réels */}
      <section aria-label="Chiffres du site" className="-mt-12 sm:-mt-16">
        <dl className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-[1.25rem] border border-border bg-card/60 backdrop-blur-md sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="produits repérés" value={stats ? String(stats.products) : '—'} />
          <Stat label="méthodes suivies" value={stats ? String(stats.methods) : '—'} />
          <Stat
            label="trafic moyen"
            value={stats && stats.products > 0 ? `${stats.avgTraffic}/100` : '—'}
          />
        </dl>
      </section>

      {/* Fonctionnalités (bento) */}
      <section aria-labelledby="features-title">
        <SectionTitle
          id="features-title"
          eyebrow="Ce que vous trouvez ici"
          title="Un tableau de bord qui répond à une question : pourquoi ça marche ?"
        />
        <div className="mt-12 grid grid-cols-1 gap-3.5 md:grid-cols-6">
          <Card className="md:col-span-4">
            <h3 className="text-xl font-bold tracking-tight text-foreground">Un classement par trafic</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Les produits sont triés selon le trafic qu'ils génèrent. Filtrez par catégorie,
              triez par ventes ou par note, retrouvez un produit en quelques lettres.
            </p>
            <div className="mt-6 space-y-3" aria-hidden="true">
              {[87, 72, 64].map((w, i) => (
                <div key={w} className="grid grid-cols-[1.75rem_1fr_2.5rem] items-center gap-3 text-sm">
                  <span className="font-mono text-muted-foreground">0{i + 1}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full origin-left rounded-full bg-gradient-to-r from-brand to-primary motion-safe:animate-grow-x"
                      style={{ width: `${w}%`, animationDelay: `${200 + i * 120}ms` }}
                    />
                  </div>
                  <span className="text-right font-mono text-primary">{w}</span>
                </div>
              ))}
              <p className="pt-1 text-xs text-muted-foreground">Illustration</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden md:col-span-2">
            <p className="bg-gradient-to-b from-foreground to-brand bg-clip-text font-mono text-7xl leading-none tracking-tighter text-transparent">
              {METHODS.length}
            </p>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground">méthodes décodées</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Lives, affiliation, WhatsApp, influence… prêtes à être associées à vos produits.
            </p>
          </Card>

          <Card className="md:col-span-2">
            <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              Chacun ses repérages
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tout le monde peut consulter. Chaque membre gère uniquement ses propres produits.
            </p>
          </Card>

          <Card className="md:col-span-4">
            <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              Les méthodes qui ramènent du trafic
            </h3>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Méthodes de vente suivies">
              {METHODS.map((m) => (
                <li key={m} className="rounded-full border border-border px-3 py-1.5 text-[13px] text-muted-foreground">
                  {m}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="md:col-span-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                  Quelle méthode compte vraiment ?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  La page Analyses additionne la contribution de chaque méthode sur tous les
                  produits pour faire ressortir celles qui amènent le plus de trafic.
                </p>
              </div>
              <Button className="shrink-0" onClick={onInsights}>
                Voir les analyses
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Comment ça marche */}
      <section aria-labelledby="steps-title">
        <SectionTitle id="steps-title" eyebrow="En trois étapes" title="Comment ça marche" />
        <ol className="mt-12 grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-[1.375rem] border border-border bg-card p-6">
              <span className="absolute right-6 top-5 font-mono text-3xl text-border" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted-foreground">
          Les scores de trafic et les ventes sont saisis par les membres : ce sont des
          estimations, pas des données officielles de Chariow.
        </p>
      </section>

      {/* Aperçu du classement réel */}
      <section aria-labelledby="top-title">
        <SectionTitle id="top-title" eyebrow="En ce moment" title="Les produits en tête du classement" />
        {products === null ? (
          <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-border bg-card motion-safe:animate-pulse" />
            ))}
          </div>
        ) : top.length === 0 ? (
          <div className="mt-12 rounded-[1.375rem] border border-dashed border-border bg-card px-6 py-12 text-center">
            <p className="font-display text-xl text-foreground">Le classement attend ses premiers produits</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Soyez le premier à repérer un produit : il apparaîtra ici dès qu'il sera enregistré.
            </p>
            <Button variant="primary" className="mt-6" onClick={onAdd}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Repérer un produit
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-3">
              {top.map((p, i) => (
                <ProductCard key={p.id} product={p} rank={i + 1} onClick={() => onProductClick(p)} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={onExplore}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Voir tout le classement
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </section>

      {/* Appel final */}
      <section
        aria-labelledby="cta-title"
        className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-16 text-center sm:px-12 sm:py-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(var(--brand)/0.3),transparent_70%)]"
        />
        <div className="relative">
          <h2 id="cta-title" className="mx-auto max-w-2xl font-display text-3xl text-foreground text-balance sm:text-5xl">
            Ton prochain produit gagnant est déjà sur le radar.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">
            Parcourez le classement sans compte, ou créez le vôtre pour enregistrer vos propres
            repérages.
          </p>
          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Button variant="primary" size="lg" onClick={onExplore}>
              Voir le classement
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button size="lg" onClick={onAdd}>
              Repérer un produit
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Radar({
  signals,
  illustrative,
}: {
  signals: { label: string; score: number }[];
  illustrative: boolean;
}) {
  return (
    <figure className="mx-auto w-full max-w-[34rem]">
      <div
        role="img"
        aria-label="Radar affichant les produits en tête du classement avec leur score de trafic"
        className="relative aspect-square w-full"
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(var(--brand)/0.14),transparent_70%)]" />
        {['inset-0', 'inset-[16%]', 'inset-[32%]', 'inset-[48%]'].map((inset) => (
          <div key={inset} className={`absolute rounded-full border border-border ${inset}`} />
        ))}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />
        <div className="radar-sweep absolute inset-0 rounded-full motion-safe:animate-sweep" />
        <div className="absolute left-1/2 top-1/2 -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full bg-foreground" />

        {signals.slice(0, BLIP_SLOTS.length).map((s, i) => {
          const slot = BLIP_SLOTS[i];
          const [text, bg] = slot.tone.split(' ');
          return (
            <div key={`${s.label}-${i}`} className="absolute" style={{ left: slot.left, top: slot.top }}>
              <span
                className={`blip absolute -ml-1.5 -mt-1.5 block h-3 w-3 rounded-full ${text} ${bg}`}
                style={{ animationDelay: slot.delay }}
              />
              <span className="absolute left-4 top-0 hidden max-w-[11rem] -translate-y-1/2 truncate whitespace-nowrap rounded-lg border border-border bg-card/95 px-2.5 py-1 font-mono text-[11px] text-foreground sm:block">
                {s.label} · <span className="text-primary">{s.score}</span>
              </span>
            </div>
          );
        })}
      </div>
      <figcaption className="mt-4 text-center text-xs text-muted-foreground">
        {illustrative
          ? "Aperçu illustratif, avec des données d'exemple."
          : 'Les produits en tête du classement, avec leur score de trafic.'}
      </figcaption>
    </figure>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-6">
      <dd className="font-mono text-4xl leading-none tracking-tight text-foreground sm:text-5xl">{value}</dd>
      <dt className="mt-2 text-sm text-muted-foreground">{label}</dt>
    </div>
  );
}

function SectionTitle({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
      <h2 id={id} className="mx-auto mt-3 max-w-3xl font-display text-3xl text-foreground text-balance sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}

function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-[1.375rem] border border-border bg-card p-6 transition-all sm:p-7 motion-safe:hover:-translate-y-0.5 hover:border-brand/60 ${className}`}
    >
      {children}
    </div>
  );
}
