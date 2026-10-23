import { useState } from 'react';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthFormProps {
  onDone: () => void;
  onCancel: () => void;
  message?: string;
}

export function AuthForm({ onDone, onCancel, message }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email.trim() || password.length < 6) {
      setError('Renseignez un email et un mot de passe d\'au moins 6 caractères.');
      return;
    }
    setLoading(true);
    if (mode === 'login') {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (authError) {
        setError('Connexion impossible : ' + authError.message);
        return;
      }
      onDone();
      return;
    }
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError('Inscription impossible : ' + authError.message);
      return;
    }
    if (data.session) {
      onDone();
    } else {
      setInfo('Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.');
      setMode('login');
    }
  }

  const inputClass =
    'w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent';

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {message ?? 'Connectez-vous pour repérer et gérer vos produits.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Mot de passe</label>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {info && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            {info}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
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
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
          >
            Annuler
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError('');
            setInfo('');
          }}
          className="text-xs text-slate-500 hover:text-slate-900 underline"
        >
          {mode === 'login' ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous'}
        </button>
      </form>
    </div>
  );
}
