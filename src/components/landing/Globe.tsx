import { useEffect, useRef } from 'react';

export interface GlobeSpot {
  label: string;
  score: number;
}

interface GlobeProps {
  spots: GlobeSpot[];
  /** Désactive la rotation automatique (préférence « réduire les animations »). */
  still?: boolean;
}

type Vec = [number, number, number];

const ll = (lat: number, lon: number): Vec => {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
};

// Emplacements des produits sur la sphère, et arcs qui les relient.
const SLOTS: Vec[] = [ll(18, -20), ll(-8, 45), ll(30, 95), ll(-28, -65), ll(48, 10), ll(8, 150)];
const LINKS: [number, number][] = [[0, 1], [1, 2], [0, 4], [3, 0], [2, 5], [4, 2]];

function slerp(a: Vec, b: Vec, t: number): Vec {
  const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(d);
  const s = Math.sin(om) || 1;
  const f = Math.sin((1 - t) * om) / s;
  const g = Math.sin(t * om) / s;
  return [a[0] * f + b[0] * g, a[1] * f + b[1] * g, a[2] * f + b[2] * g];
}

/** Lit les couleurs du thème (canaux RGB des variables CSS) pour dessiner dans le canvas. */
function readTheme() {
  const style = getComputedStyle(document.documentElement);
  const channels = (name: string) => style.getPropertyValue(name).trim().split(/\s+/).join(',');
  return {
    primary: channels('--primary'),
    brand: channels('--brand'),
    foreground: channels('--foreground'),
    card: channels('--card'),
    border: channels('--border'),
  };
}

/** Globe 3D interactif dessiné sur canvas : points, arcs lumineux et produits qui pulsent. */
export function Globe({ spots, still = false }: GlobeProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotsRef = useRef(spots);

  useEffect(() => {
    spotsRef.current = spots;
  }, [spots]);

  useEffect(() => {
    const box = boxRef.current;
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!box || !cv || !ctx) return;

    let w = 0;
    let h = 0;
    let radius = 0;
    let rotY = 0.6;
    let rotX = -0.35;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;
    let visible = true;
    let theme = readTheme();
    // Sur fond clair, les points pâles disparaissent : on renforce l'opacité.
    let boost = document.documentElement.classList.contains('dark') ? 1 : 1.9;

    const count = window.innerWidth < 700 ? 650 : 1100;
    const dots: Vec[] = [];
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = i * Math.PI * (3 - Math.sqrt(5));
      dots.push([Math.cos(t) * r, y, Math.sin(t) * r]);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box!.clientWidth;
      h = box!.clientHeight;
      cv!.width = w * dpr;
      cv!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.min(w, h) * 0.4;
    }

    const rot = (v: Vec): Vec => {
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);
      const x = v[0] * cy + v[2] * sy;
      const z = -v[0] * sy + v[2] * cy;
      return [x, v[1] * cx - z * sx, v[1] * sx + z * cx];
    };
    const proj = (v: Vec): [number, number] => [w / 2 + v[0] * radius, h / 2 - v[1] * radius];
    const rgba = (c: string, a: number) => `rgba(${c},${a})`;

    function frame(time: number) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const list = spotsRef.current.slice(0, SLOTS.length);
      ctx!.clearRect(0, 0, w, h);

      const halo = ctx!.createRadialGradient(w / 2, h / 2, radius * 0.2, w / 2, h / 2, radius * 1.05);
      halo.addColorStop(0, rgba(theme.brand, 0.12));
      halo.addColorStop(1, rgba(theme.brand, 0));
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(w / 2, h / 2, radius * 1.05, 0, 7);
      ctx!.fill();

      for (const d of dots) {
        const v = rot(d);
        const [x, y] = proj(v);
        const a = Math.min(1, (0.14 + 0.6 * Math.max(0, v[2] * 0.5 + 0.5)) * boost);
        ctx!.fillStyle = v[2] > 0 ? rgba(theme.brand, a) : rgba(theme.brand, a * 0.35);
        ctx!.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
      }

      LINKS.forEach(([i, j], k) => {
        if (i >= list.length || j >= list.length) return;
        const a = SLOTS[i];
        const b = SLOTS[j];
        ctx!.beginPath();
        let started = false;
        for (let t = 0; t <= 1.0001; t += 1 / 40) {
          const m = slerp(a, b, t);
          const l = 1 + 0.28 * Math.sin(Math.PI * t);
          const v = rot([m[0] * l, m[1] * l, m[2] * l]);
          if (v[2] < -0.15) {
            started = false;
            continue;
          }
          const [x, y] = proj(v);
          if (!started) {
            ctx!.moveTo(x, y);
            started = true;
          } else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = rgba(theme.primary, Math.min(1, 0.55 * boost));
        ctx!.lineWidth = 1.2;
        ctx!.stroke();

        const t = (time / 2600 + k * 0.37) % 1;
        const m = slerp(a, b, t);
        const l = 1 + 0.28 * Math.sin(Math.PI * t);
        const v = rot([m[0] * l, m[1] * l, m[2] * l]);
        if (v[2] > -0.15) {
          const [x, y] = proj(v);
          ctx!.fillStyle = rgba(theme.foreground, 1);
          ctx!.shadowColor = rgba(theme.primary, 1);
          ctx!.shadowBlur = 12;
          ctx!.beginPath();
          ctx!.arc(x, y, 2.2, 0, 7);
          ctx!.fill();
          ctx!.shadowBlur = 0;
        }
      });

      list.forEach((s, i) => {
        const v = rot(SLOTS[i]);
        if (v[2] < 0.02) return;
        const [x, y] = proj(v);
        const pulse = (time / 1200 + i * 0.4) % 1;
        ctx!.strokeStyle = rgba(theme.primary, 1 - pulse);
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.arc(x, y, 4 + pulse * 16, 0, 7);
        ctx!.stroke();
        ctx!.fillStyle = rgba(theme.primary, 1);
        ctx!.shadowColor = rgba(theme.primary, 1);
        ctx!.shadowBlur = 14;
        ctx!.beginPath();
        ctx!.arc(x, y, 4, 0, 7);
        ctx!.fill();
        ctx!.shadowBlur = 0;

        if (v[2] > 0.35 && w > 380) {
          const text = `${s.label.length > 22 ? s.label.slice(0, 21) + '…' : s.label} · ${s.score}`;
          ctx!.font = '500 11px "JetBrains Mono", monospace';
          const tw = ctx!.measureText(text).width + 16;
          ctx!.fillStyle = rgba(theme.card, 0.94);
          ctx!.strokeStyle = rgba(theme.border, 1);
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.roundRect(x + 10, y - 11, tw, 22, 8);
          ctx!.fill();
          ctx!.stroke();
          ctx!.fillStyle = rgba(theme.foreground, 1);
          ctx!.fillText(text, x + 18, y + 4);
        }
      });

      if (!dragging && !still) rotY += 0.0035;
    }

    function onDown(e: PointerEvent) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      box!.setPointerCapture(e.pointerId);
    }
    function onMove(e: PointerEvent) {
      if (!dragging) return;
      rotY += (e.clientX - lastX) * 0.008;
      rotX = Math.max(-1, Math.min(1, rotX + (e.clientY - lastY) * 0.006));
      lastX = e.clientX;
      lastY = e.clientY;
    }
    const onUp = () => {
      dragging = false;
    };

    resize();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(box);
    // Le thème clair/sombre change les couleurs : on relit les variables.
    const mo = new MutationObserver(() => {
      theme = readTheme();
      boost = document.documentElement.classList.contains('dark') ? 1 : 1.9;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    box.addEventListener('pointerdown', onDown);
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerup', onUp);
    box.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      box.removeEventListener('pointerdown', onDown);
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerup', onUp);
      box.removeEventListener('pointercancel', onUp);
    };
  }, [still]);

  return (
    <div ref={boxRef} className="relative h-full w-full cursor-grab touch-pan-y active:cursor-grabbing">
      <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgb(var(--brand)/0.3),rgb(var(--primary)/0.1)_55%,transparent_70%)] blur-2xl" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

