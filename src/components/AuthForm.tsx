import { useState } from 'react';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface AuthFormProps {
  onDone: () => void;
  onCancel: () => void;
  message?: string;
}

export function AuthForm({ onDone, onCancel, message }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || password.length < 8) {
      setError('Renseignez un email et un mot de passe d\'au moins 8 caractères.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Renseignez votre nom.');
      return;
    }
    setLoading(true);
    if (mode === 'login') {
      const { error: authError } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (authError) {
        setError(
          authError.status === 401
            ? 'Connexion impossible : email ou mot de passe incorrect.'
            : 'Connexion impossible : ' + (authError.message ?? 'erreur inconnue'),
        );
        return;
      }
      onDone();
      return;
    }
    const { error: authError } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError('Inscription impossible : ' + (authError.message ?? 'erreur inconnue'));
      return;
    }
    onDone();
  }

  const inputClass =
    'w-full text-sm border border-input rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent';

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-foreground">
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {message ?? 'Connectez-vous pour repérer et gérer vos produits.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nom</label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mot de passe</label>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted"
          >
            Annuler
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError('');
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          {mode === 'login' ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous'}
        </button>
      </form>
    </div>
  );
}
