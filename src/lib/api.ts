// En développement, Vite redirige /api vers le serveur (voir vite.config.ts).
// En production, définir VITE_API_URL si l'API est sur un autre domaine.
export const API_URL: string = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function extractMessage(data: unknown, status: number): string {
  const error = (data as { error?: unknown } | null)?.error;
  if (typeof error === 'string') return error;
  const issues = Array.isArray(error) ? error : (error as { issues?: unknown } | undefined)?.issues;
  if (Array.isArray(issues)) {
    const messages = issues
      .map((i) => (i as { message?: string }).message)
      .filter((m): m is string => !!m);
    if (messages.length > 0) return messages.join(' ; ');
  }
  return status === 400 ? 'Données invalides.' : `Erreur ${status}`;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Serveur injoignable. Réessayez dans un instant.', 0);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(extractMessage(data, res.status), res.status);
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<void>('DELETE', path),
};

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Erreur inconnue';
}
