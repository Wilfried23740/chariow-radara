/** Clé publique Turnstile ; sans elle, la protection anti-robots est simplement absente. */
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
