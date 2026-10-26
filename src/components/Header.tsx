import { Radar, LayoutDashboard, Plus, BarChart3, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type View = 'dashboard' | 'add' | 'insights';

interface HeaderProps {
  view: View;
  onNavigate: (view: View) => void;
  onLogin: () => void;
}

export function Header({ view, onNavigate, onLogin }: HeaderProps) {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow motion-reduce:transition-none">
              <Radar className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-lg text-foreground leading-none">Chariow Radar</h1>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">Repérage & analyse</p>
            </div>
          </button>

          <nav className="flex items-center gap-1">
            <NavButton
              active={view === 'dashboard'}
              onClick={() => onNavigate('dashboard')}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Classement"
            />
            <NavButton
              active={view === 'insights'}
              onClick={() => onNavigate('insights')}
              icon={<BarChart3 className="w-4 h-4" />}
              label="Analyses"
            />
            <NavButton
              active={view === 'add'}
              onClick={() => onNavigate('add')}
              icon={<Plus className="w-4 h-4" />}
              label="Repérer"
            />
            {!loading &&
              (user ? (
                <button
                  onClick={signOut}
                  title={user.email ?? undefined}
                  className="flex items-center gap-1.5 min-h-11 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              ) : (
                <button
                  onClick={onLogin}
                  className="flex items-center gap-1.5 min-h-11 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Connexion</span>
                </button>
              ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 min-h-11 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
