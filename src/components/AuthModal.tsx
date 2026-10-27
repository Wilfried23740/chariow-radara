import { useId, useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  message?: string;
}

// Le formulaire est remonté à chaque ouverture : champs et erreurs repartent de zéro.
export function AuthModal({ open, onClose, onDone, message }: AuthModalProps) {
  if (!open) return null;
  return <AuthDialog onClose={onClose} onDone={onDone} message={message} />;
}

function AuthDialog({
  onClose,
  onDone,
  message,
}: {
  onClose: () => void;
  onDone: () => void;
  message?: string;
}) {
  const formId = useId();
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

  // 16 px sur mobile : évite le zoom automatique d'iOS au focus.
  const inputClass =
    'w-full min-h-11 text-base sm:text-sm border border-input rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5';

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={mode === 'login' ? 'Connexion' : 'Créer un compte'}
      description={message ?? 'Connectez-vous pour repérer et gérer vos produits.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form={formId} variant="primary" loading={loading}>
            {!loading && (mode === 'login' ? <LogIn className="h-4 w-4" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />)}
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4 pb-2">
        {mode === 'signup' && (
          <div>
            <label htmlFor={`${formId}-name`} className={labelClass}>Nom</label>
            <input
              id={`${formId}-name`}
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label htmlFor={`${formId}-email`} className={labelClass}>Email</label>
          <input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-password`} className={labelClass}>Mot de passe</label>
          <input
            id={`${formId}-password`}
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <div role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError('');
          }}
          className="min-h-11 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          {mode === 'login' ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous'}
        </button>
      </form>
    </Modal>
  );
}
