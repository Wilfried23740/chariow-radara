import { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Globe, type GlobeSpot } from './Globe';

interface TunnelStageProps {
  spots: GlobeSpot[];
  /** Vrai tant que les produits affichés sont des exemples. */
  illustrative: boolean;
  productCount: number | null;
  methodCount: number | null;
  onExplore: () => void;
  onAdd: () => void;
}

const DEPTH = 3600;
const RINGS = 16;
const GAP = DEPTH / RINGS;

// Positions des cartes produit dans le tunnel (x, y en vw / vh, z en px).
const CARD_SLOTS = [
  { x: '-30vw', y: '-14vh', z: -500 },
  { x: '30vw', y: '10vh', z: -1000 },
  { x: '-27vw', y: '16vh', z: -1600 },
  { x: '28vw', y: '-16vh', z: -2200 },
  { x: '-24vw', y: '-8vh', z: -2800 },
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
const ease = (t: number) => t * t * (3 - 2 * t);

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scène d'ouverture : un tunnel de radar (défilement), puis le globe 3D qui surgit
 * derrière le chiffre clé et glisse sur le côté pour laisser place aux résultats.
 */
export function TunnelStage({
  spots,
  illustrative,
  productCount,
  methodCount,
  onExplore,
  onAdd,
}: TunnelStageProps) {
  const reduce = useMemo(prefersReducedMotion, []);
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const hud1Ref = useRef<HTMLDivElement>(null);
  const hud2Ref = useRef<HTMLDivElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const cards = spots.slice(0, CARD_SLOTS.length);
  const productsWord = productCount === 1 ? 'produit repéré' : 'produits repérés';
  const methodsWord = methodCount === 1 ? 'méthode' : 'méthodes';
  const decodedWord = methodCount === 1 ? 'décodée' : 'décodées';
  const figures = (
    <>
      <span className="font-mono">{productCount ?? '—'}</span>
    </>
  );

  useEffect(() => {
    const stage = stageRef.current;
    const sticky = stickyRef.current;
    const scene = sceneRef.current;
    if (!stage || !sticky || !scene) return;

    const rings = Array.from(scene.querySelectorAll<HTMLElement>('[data-ring]'));
    const tunnelCards = Array.from(scene.querySelectorAll<HTMLElement>('[data-card]'));

    let raf = 0;
    function update() {
      raf = 0;
      const rect = stage!.getBoundingClientRect();
      const span = Math.max(1, stage!.offsetHeight - sticky!.offsetHeight);
      const p = reduce ? 1 : clamp(-rect.top / span, 0, 1);
      const W = window.innerWidth;
      const H = sticky!.offsetHeight;
      const wide = W > 900;

      // 1) Tunnel : 0 → 0,46
      const adv = seg(p, 0, 0.46) * (DEPTH + 300);
      scene!.style.transform = `translateZ(${adv}px)`;
      const fade = (z: number) => clamp((650 - (z + adv)) / 450, 0, 1);
      rings.forEach((el, i) => (el.style.opacity = String(fade(-i * GAP))));
      const cardsIn = seg(p, 0.06, 0.14);
      tunnelCards.forEach((el) => (el.style.opacity = String(fade(Number(el.dataset.z)) * cardsIn)));
      if (coreRef.current) coreRef.current.style.opacity = String(1 - seg(p, 0.4, 0.58));
      if (hud1Ref.current) {
        hud1Ref.current.style.opacity = String(1 - seg(p, 0, 0.09));
        hud1Ref.current.style.pointerEvents = p > 0.05 ? 'none' : 'auto';
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - seg(p, 0, 0.04));

      // 2) Chiffre clé, devant le globe
      if (hud2Ref.current) {
        hud2Ref.current.style.opacity = String(ease(seg(p, 0.37, 0.46)) * (1 - ease(seg(p, 0.64, 0.72))));
      }

      // 3) Le globe surgit du fond, puis glisse sur le côté
      const enter = ease(seg(p, 0.5, 0.66));
      const move = ease(seg(p, 0.7, 0.92));
      const finalX = wide ? W * 0.22 : 0;
      const finalY = wide ? 0 : H * 0.17;
      const finalS = wide ? (W < 1200 ? 0.8 : 0.95) : W < 640 ? 0.95 : 0.85;
      const s = 1.08 - (1.08 - finalS) * move;
      if (globeRef.current) {
        globeRef.current.style.transform = `translate3d(${finalX * move}px,${finalY * move}px,${-1500 * (1 - enter)}px) scale(${s})`;
        globeRef.current.style.opacity = String(0.5 * seg(p, 0.5, 0.58) + 0.5 * move);
        globeRef.current.style.pointerEvents = move > 0.6 ? 'auto' : 'none';
      }

      // 4) Résultats à côté du globe
      const r = ease(seg(p, 0.76, 0.9));
      if (resRef.current) {
        resRef.current.style.opacity = String(r);
        resRef.current.style.transform = wide ? `translateX(${(1 - r) * -40}px)` : `translateY(${(1 - r) * -20}px)`;
        resRef.current.style.pointerEvents = r > 0.6 ? 'auto' : 'none';
      }
      sticky!.style.setProperty('--bgglow', move.toFixed(3));
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onPointer = (e: PointerEvent) => {
      const r = sticky!.getBoundingClientRect();
      sticky!.style.setProperty('--mx', `${((e.clientX - r.left) / r.width - 0.5) * 120}px`);
      sticky!.style.setProperty('--my', `${((e.clientY - r.top) / r.height - 0.5) * 80}px`);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    if (!reduce) sticky.addEventListener('pointermove', onPointer);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      sticky.removeEventListener('pointermove', onPointer);
    };
  }, [reduce, cards.length]);

  return (
    <div ref={stageRef} className="relative" style={{ height: reduce ? 'calc(100dvh - 4rem)' : '620vh' }}>
      <div
        ref={stickyRef}
        // Sur mobile, la hauteur exclut la barre d'onglets du bas pour que les boutons restent visibles.
        className="sticky top-16 h-[calc(100dvh-4rem-4.5rem-env(safe-area-inset-bottom))] overflow-hidden bg-[radial-gradient(70%_60%_at_50%_50%,rgb(var(--muted)),rgb(var(--background)))] sm:h-[calc(100dvh-4rem)]"
        style={{
          perspective: '900px',
          perspectiveOrigin: 'calc(50% + var(--mx, 0px)) calc(50% + var(--my, 0px))',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(60%_50%_at_78%_30%,rgb(var(--brand)/0.22),transparent_70%)]"
          style={{ opacity: 'var(--bgglow, 0)' }}
        />

        {/* Tunnel */}
        <div ref={sceneRef} aria-hidden="true" className="absolute inset-0 will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
          {Array.from({ length: RINGS }).map((_, i) => (
            <div
              key={i}
              data-ring
              className="tunnel-ring"
              style={{
                transform: `translateZ(${-i * GAP}px)`,
                animationDuration: `${30 + i * 3}s`,
                animationDirection: i % 2 ? 'reverse' : 'normal',
              }}
            />
          ))}
          <div ref={coreRef} className="tunnel-core" style={{ transform: `translateZ(${-DEPTH - 200}px)` }} />
          {cards.map((c, i) => {
            const slot = CARD_SLOTS[i];
            return (
              <div
                key={`${c.label}-${i}`}
                data-card
                data-z={slot.z}
                className="tunnel-card"
                style={{ transform: `translate3d(${slot.x},${slot.y},${slot.z}px)` }}
              >
                <span className="font-mono text-[11px] tracking-widest text-primary">N°{i + 1}</span>
                <b className="mt-1 block truncate text-base text-foreground">{c.label}</b>
                <span className="float-right font-mono text-[13px] text-primary">{c.score}</span>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full bg-gradient-to-r from-brand to-primary" style={{ width: `${c.score}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Globe */}
        <div
          ref={globeRef}
          role="img"
          aria-label="Globe 3D interactif : chaque point est un produit repéré, chaque arc une méthode de vente. Glissez pour le faire tourner."
          className="absolute left-1/2 top-1/2 z-[2] aspect-square w-[min(78vmin,660px)] will-change-transform"
          style={{
            opacity: 0,
            pointerEvents: 'none',
            // Centrage par marges négatives : le transform est réservé à l'animation.
            marginLeft: 'calc(min(78vmin, 660px) / -2)',
            marginTop: 'calc(min(78vmin, 660px) / -2)',
          }}
        >
          <Globe spots={spots} still={reduce} />
        </div>

        {/* Accroche */}
        <div ref={hud1Ref} className="absolute inset-0 z-[5] grid place-items-center px-5 text-center">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-background/50 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Plongez dans le marché
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[0.98] text-foreground text-balance sm:text-6xl lg:text-7xl">
              Voyez ce qui{' '}
              <span className="bg-gradient-to-r from-brand to-primary bg-clip-text text-transparent">se vend</span>{' '}
              avant les autres.
            </h1>
            <p className="mx-auto mt-5 hidden max-w-xl text-base text-muted-foreground sm:block sm:text-lg">
              Chariow Radar classe les produits numériques et révèle les méthodes de vente qui font vraiment
              venir le trafic. Public, gratuit, sans compte pour explorer.
            </p>
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
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
        </div>

        {/* Chiffre clé au bout du tunnel (décoratif : repris dans les résultats) */}
        <div ref={hud2Ref} aria-hidden="true" className="absolute inset-0 z-[5] grid place-items-center px-5 text-center" style={{ opacity: 0 }}>
          <div className="max-w-3xl">
            <div className="stage-big">{figures}</div>
            <p className="font-display text-3xl leading-none text-foreground [text-shadow:0_4px_40px_rgb(var(--background)),0_0_12px_rgb(var(--background))] sm:text-6xl">
              {productsWord}, <span className="text-primary">{methodCount ?? '—'} {methodsWord}</span> {decodedWord}.
            </p>
          </div>
        </div>

        {/* Résultats, face au globe */}
        <div
          ref={resRef}
          className="absolute inset-0 z-[5] flex items-start px-5 pt-8 sm:px-8 lg:items-center lg:pl-[max(2rem,calc((100vw-72rem)/2+2rem))] lg:pt-0"
          style={{ opacity: 0, pointerEvents: 'none' }}
        >
          <div className="w-full max-w-[31rem]">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-background/50 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Résultat de la recherche
            </p>
            <div className="stage-big mt-3 !text-[clamp(54px,9vw,120px)]">
              <span className="font-mono">{productCount ?? '—'}</span>
            </div>
            <h2 className="font-display text-3xl leading-[1.05] text-foreground sm:text-5xl">
              {productsWord}, <span className="text-primary">{methodCount ?? '—'} {methodsWord}</span> {decodedWord}.
            </h2>
            <p className="mt-4 hidden max-w-md text-base text-muted-foreground lg:block">
              Chaque point du globe est un produit, chaque arc une méthode de vente qui fait voyager le trafic.
            </p>
            <ul className="mt-5 hidden gap-2 lg:grid" aria-label="Produits en tête du classement">
              {spots.slice(0, 3).map((s, i) => (
                <li
                  key={`${s.label}-${i}`}
                  className="grid grid-cols-[1.75rem_1fr_2.5rem] items-center gap-2.5 rounded-2xl border border-border bg-card/70 px-3.5 py-2.5 text-sm backdrop-blur-md"
                >
                  <span className="font-mono text-xs text-primary">0{i + 1}</span>
                  <span className="truncate text-foreground">{s.label}</span>
                  <span className="text-right font-mono text-[13px] text-primary">{s.score}</span>
                </li>
              ))}
            </ul>
            {illustrative && (
              <p className="mt-3 hidden text-xs text-muted-foreground lg:block">Aperçu illustratif, avec des données d'exemple.</p>
            )}
            <div className="mt-6 hidden sm:block">
              <Button variant="primary" size="lg" onClick={onExplore}>
                Voir le classement
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={hintRef}
          aria-hidden="true"
          className="absolute inset-x-0 bottom-6 z-[6] hidden text-center text-xs uppercase tracking-[0.14em] text-muted-foreground sm:block"
          style={{ display: reduce ? 'none' : undefined }}
        >
          Faites défiler
          <span className="tunnel-drip mx-auto mt-2 block h-8 w-px bg-gradient-to-b from-primary to-transparent" />
        </div>
      </div>
    </div>
  );
}

