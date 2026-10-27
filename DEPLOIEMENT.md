# Mise en ligne de Chariow Radar

Tout est gratuit : **Neon** (base PostgreSQL), **Render** (API), **Vercel** (site), **Resend** (emails) et **Cloudflare Turnstile** (anti-robots).

Le site (Vercel) transmet les appels `/api` à l'API (Render) grâce à `vercel.json`. Pour le navigateur, tout vient d'un seul domaine : les cookies de connexion fonctionnent donc sans réglage particulier.

```
Visiteur ──► Vercel (site + /api) ──► Render (API) ──► Neon (PostgreSQL)
```

## Avant de commencer

- Le code doit être sur GitHub (tu le pousses toi-même après relecture).
- Ne mets jamais de mot de passe ou de clé dans un fichier du dépôt : tout se saisit dans les tableaux de bord ci-dessous.

## 1. Base de données : Neon

1. Créer un compte sur neon.tech, puis un projet (région la plus proche de tes visiteurs).
2. Copier l'**adresse de connexion** (`postgresql://…?sslmode=require`). Elle servira pour `DATABASE_URL`.

## 2. API : Render

1. Sur render.com : **New → Blueprint**, choisir le dépôt GitHub. Render lit `render.yaml`.
2. Renseigner les variables demandées :

| Variable | Valeur |
| --- | --- |
| `DATABASE_URL` | l'adresse Neon |
| `BETTER_AUTH_URL` | l'adresse finale du **site** (ex. `https://chariow-radar.vercel.app`), connue à l'étape 3 |
| `FRONTEND_URL` | la même adresse |
| `BETTER_AUTH_SECRET` | généré automatiquement par Render |
| `RESEND_API_KEY`, `EMAIL_FROM`, `TURNSTILE_SECRET_KEY` | étapes 4 et 5 (laisser vide pour l'instant) |

3. Au démarrage, l'API applique les migrations et charge les 12 méthodes de vente (sans doublon).
4. Noter l'adresse de l'API (ex. `https://chariow-radar-api.onrender.com`) et vérifier `…/api/health`.

> L'offre gratuite de Render met l'API en veille après 15 minutes sans visite : la première requête suivante prend environ une minute.

## 3. Site : Vercel

1. Dans `vercel.json`, remplacer `REMPLACER-PAR-VOTRE-API.onrender.com` par l'adresse de l'API Render, puis pousser.
2. Sur vercel.com : **Add New → Project**, importer le dépôt (Vite est détecté automatiquement).
3. Ne pas définir `VITE_API_URL` : les appels passent par `/api`.
4. Une fois l'adresse du site connue, retourner sur Render et compléter `BETTER_AUTH_URL` et `FRONTEND_URL`.

## 4. Confirmation d'email : Resend

1. Compte sur resend.com, puis **API Keys → Create**.
2. Sur Render : `RESEND_API_KEY` = la clé.
3. Sans domaine vérifié, Resend n'envoie qu'à l'adresse de ton propre compte (`EMAIL_FROM` = `Chariow Radar <onboarding@resend.dev>`). Pour écrire à tous les inscrits, ajouter et vérifier un domaine dans Resend, puis régler `EMAIL_FROM` avec une adresse de ce domaine.
4. Dès que la clé est présente, les nouveaux comptes doivent confirmer leur email avant de se connecter.

## 5. Anti-robots : Cloudflare Turnstile

1. Compte Cloudflare gratuit, **Turnstile → Add widget**, ajouter le domaine du site.
2. Sur Render : `TURNSTILE_SECRET_KEY` = clé secrète.
3. Sur Vercel : variable `VITE_TURNSTILE_SITE_KEY` = clé publique du site, puis redéployer.
4. Le formulaire de connexion affiche alors le contrôle, et l'API refuse les requêtes sans jeton valide.

## 6. Vérifications finales

- `…/api/health` répond `{"status":"ok","database":"connected"}`.
- La page d'accueil s'affiche et le classement se charge.
- Inscription, email de confirmation, connexion, ajout d'un produit.
- Après quelques tentatives de connexion erronées, l'API répond « Trop de tentatives ».

## Protections déjà en place dans l'API

- Limitation du nombre de requêtes par visiteur (lecture : 240 par minute, écriture : 40) ; connexion limitée à 5 par minute et inscription à 5 par heure.
- Taille des requêtes limitée, en-têtes de sécurité, cookies sécurisés en production.
- Démarrage refusé en production si le secret fait moins de 32 caractères ou si l'adresse n'est pas en `https://`.

La limitation de requêtes est gardée en mémoire : suffisant pour une seule instance d'API, comme sur l'offre gratuite.
