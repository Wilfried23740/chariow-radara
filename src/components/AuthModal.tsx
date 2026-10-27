import { useId, useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Turnstile } from '@/components/ui/Turnstile';
import { TURNSTILE_SITE_KEY } from '@/lib/turnstile';

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
  // Adresse à laquelle un email de confirmation vient d'être envoyé.
  const [sentTo, setSentTo] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Un jeton Turnstile ne sert qu'une fois : on remonte le widget après chaque tentative.
  const [captchaRound, setCaptchaRound] = useState(0);

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
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError('Validez le contrôle anti-robot avant de continuer.');
      return;
    }
    const fetchOptions = captchaToken ? { headers: { 'x-captcha-response': captchaToken } } : undefined;
    setLoading(true);
    if (mode === 'login') {
      const { error: authError } = await authClient.signIn.email(
        { email: email.trim(), password },
        fetchOptions,
      );
      setLoading(false);
      if (authError) {
        setError(
          authError.status === 401
            ? 'Connexion impossible : email ou mot de passe incorrect.'
            : authError.status === 403
              ? 'Confirmez d\'abord votre adresse email grâce au lien reçu à l\'inscription.'
              : authError.status === 429
                ? 'Trop de tentatives. Réessayez dans une minute.'
                : 'Connexion impossible : ' + (authError.message ?? 'erreur inconnue'),
        );
        setCaptchaToken(null);
        setCaptchaRound((r) => r + 1);
        return;
      }
      onDone();
      return;
    }
    const { data, error: authError } = await authClient.signUp.email(
      {
        name: name.trim(),
        email: email.trim(),
        password,
        // Après clic sur le lien de confirmation, retour sur le site.
        callbackURL: window.location.origin,
      },
      fetchOptions,
    );
    setLoading(false);
    if (authError) {
      setError(
        authError.status === 429
          ? 'Trop de tentatives. Réessayez plus tard.'
          : 'Inscription impossible : ' + (authError.message ?? 'erreur inconnue'),
      );
      setCaptchaToken(null);
      setCaptchaRound((r) => r + 1);
      return;
    }
    // Sans session créée, la confirmation d'email est exigée : on invite à consulter sa boîte.
    if (!data?.token) {
      setSentTo(email.trim());
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
      title={sentTo ? 'Vérifiez votre boîte mail' : mode === 'login' ? 'Connexion' : 'Créer un compte'}
      description={sentTo ? undefined : (message ?? 'Connectez-vous pour repérer et gérer vos produits.')}
      footer={
        sentTo ? (
          <Button variant="primary" onClick={onClose}>
            Fermer
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" form={formId} variant="primary" loading={loading}>
              {!loading && (mode === 'login' ? <LogIn className="h-4 w-4" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />)}
              {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </Button>
          </>
        )
      }
    >
      {sentTo ? (
        <div role="status" className="space-y-3 pb-2 text-sm text-muted-foreground">
          <p>
            Compte créé. Nous avons envoyé un lien de confirmation à{' '}
            <strong className="text-foreground">{sentTo}</strong>.
          </p>
          <p>Cliquez sur ce lien pour activer votre compte, puis revenez vous connecter. Pensez à regarder dans les courriers indésirables.</p>
        </div>
      ) : (
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

        <Turnstile key={captchaRound} onToken={setCaptchaToken} />

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
      )}
    </Modal>
  );
}
