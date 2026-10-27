import { useState } from 'react';
import { Radar, LayoutDashboard, Plus, BarChart3, LogIn, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type View = 'home' | 'dashboard' | 'add' | 'insights';

interface HeaderProps {
  view: View;
  onNavigate: (view: View) => void;
  onLogin: () => void;
}

const TABS: { view: Exclude<View, 'home'>; label: string; icon: typeof Plus }[] = [
  { view: 'dashboard', label: 'Classement', icon: LayoutDashboard },
  { view: 'insights', label: 'Analyses', icon: BarChart3 },
  { view: 'add', label: 'Repérer', icon: Plus },
];

export function Header({ view, onNavigate, onLogin }: HeaderProps) {
  const { user, loading, signOut } = useAuth();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // stockage indisponible : le choix vaut pour cette visite seulement
    }
    setDark(next);
  }

  const iconButton =
    'flex items-center justify-center min-h-11 min-w-11 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground';

  return (
    <>
      <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl 2xl:max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <button
              onClick={() => onNavigate('home')}
              aria-label="Chariow Radar, accueil"
              className="flex items-center gap-2.5 group min-w-0"
            >
              <div className="w-9 h-9 shrink-0 rounded-full bg-card border border-border flex items-center justify-center shadow-[0_0_18px_rgb(var(--primary)/0.25)] group-hover:border-primary/60 transition-colors motion-reduce:transition-none">
                <Radar className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div className="text-left min-w-0">
                <span className="block font-display text-lg text-foreground leading-none truncate">Chariow Radar</span>
                <p className="hidden sm:block font-mono text-[10px] uppercase tracking-widest text-muted-foreground leading-none mt-1">
                  Repérage & analyse
                </p>
              </div>
            </button>

            {/* Navigation principale : dans l'en-tête dès la tablette, en barre du bas sur mobile. */}
            <nav aria-label="Navigation principale" className="hidden sm:flex items-center gap-1">
              {TABS.map(({ view: v, label, icon: Icon }) => (
                <button
                  key={v}
                  onClick={() => onNavigate(v)}
                  aria-current={view === v ? 'page' : undefined}
                  className={`flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    view === v
                      ? 'bg-primary text-primary-foreground shadow-[0_0_24px_rgb(var(--primary)/0.35)]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden md:inline">{label}</span>
                  <span className="md:hidden sr-only">{label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                className={iconButton}
              >
                {dark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
              </button>
              {!loading &&
                (user ? (
                  <button
                    onClick={signOut}
                    title={user.email ?? undefined}
                    aria-label="Déconnexion"
                    className="flex items-center gap-1.5 min-h-11 min-w-11 justify-center px-3 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden md:inline">Déconnexion</span>
                  </button>
                ) : (
                  <button
                    onClick={onLogin}
                    className="flex items-center gap-1.5 min-h-11 px-4 rounded-full border border-border text-sm font-medium text-foreground hover:border-brand"
                  >
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    Connexion
                  </button>
                ))}
            </div>
          </div>
        </div>
      </header>

      {/* Barre d'onglets du bas : accessible au pouce sur téléphone. */}
      <nav
        aria-label="Navigation principale"
        className="sm:hidden fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-3">
          {TABS.map(({ view: v, label, icon: Icon }) => (
            <li key={v}>
              <button
                onClick={() => onNavigate(v)}
                aria-current={view === v ? 'page' : undefined}
                className={`flex w-full flex-col items-center justify-center gap-1 min-h-14 text-[11px] font-medium transition-colors ${
                  view === v ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                    view === v ? 'bg-primary/15' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
