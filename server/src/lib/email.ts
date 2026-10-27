import { env } from '../env.js';

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch);

/** Envoie un email via l'API Resend (fetch, sans dépendance). */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.resendApiKey) throw new Error('RESEND_API_KEY absente : email non envoyé');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.emailFrom, to, subject, html }),
  });
  if (!res.ok) {
    throw new Error(`Resend a répondu ${res.status} : ${await res.text()}`);
  }
}

export async function sendVerificationEmail(to: string, name: string, url: string): Promise<void> {
  const safeName = escapeHtml(name || 'bonjour');
  const safeUrl = escapeHtml(url);
  await sendEmail(
    to,
    'Confirmez votre adresse email — Chariow Radar',
    `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#13123A">
      <h1 style="font-size:22px;margin:0 0 12px">Bienvenue sur Chariow Radar</h1>
      <p>Bonjour ${safeName}, confirmez votre adresse email pour activer votre compte.</p>
      <p style="margin:28px 0"><a href="${safeUrl}" style="background:#047857;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700">Confirmer mon email</a></p>
      <p style="font-size:13px;color:#555882">Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.</p>
    </div>`,
  );
}
