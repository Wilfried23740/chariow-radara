# Chariow Radar

Application de repérage et d'analyse des produits digitaux vendus sur [Chariow](https://chariow.com). Elle permet d'enregistrer les produits, de les classer par trafic généré et d'identifier les méthodes de vente (Facebook Ads, TikTok, email, affiliation…) qui performent le mieux.

Le site est consultable sans connexion. Il faut un compte pour ajouter des produits, et chacun ne peut modifier ou supprimer que ses propres produits.

## Fonctionnalités

- **Classement** : liste des produits avec recherche, filtre par catégorie et tri (trafic, ventes, note, récent)
- **Fiche produit** : détail d'un produit et des méthodes de vente associées
- **Repérer** : formulaire d'ajout d'un produit (compte requis)
- **Analyses** : classement des méthodes de vente par contribution au trafic
- **Comptes** : inscription et connexion par email et mot de passe

## Architecture

| Dossier | Rôle | Technologies |
| --- | --- | --- |
| `/` (racine) | Site | React 18, TypeScript, Vite, Tailwind CSS, lucide-react |
| `server/` | API | Node.js, Hono, Drizzle ORM, Better Auth, Zod |
| base de données | Données et comptes | PostgreSQL |

Le site appelle l'API sous `/api`. En développement, Vite redirige ces appels vers le serveur (port 3001).

## Installation

Prérequis : Node.js 20 ou plus, PostgreSQL.

1. **Dépendances**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Base de données** : créer un utilisateur et une base PostgreSQL.
   ```bash
   psql -U postgres -c "CREATE USER chariow WITH PASSWORD 'mot_de_passe';"
   psql -U postgres -c "CREATE DATABASE chariow_radar OWNER chariow;"
   ```

3. **Configuration** : copier `.env.example` en `.env` à la racine et le remplir (`DATABASE_URL`, `BETTER_AUTH_SECRET`). Le secret doit être aléatoire, d'au moins 32 caractères. Le fichier `.env` est ignoré par git : ne le commite jamais.

4. **Tables et données de départ** (depuis `server/`)
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## Lancer en développement

Deux terminaux :

```bash
# Terminal 1 : API (http://localhost:3001)
cd server && npm run dev

# Terminal 2 : site (http://localhost:5173)
npm run dev
```

## Scripts

| Commande | Dossier | Rôle |
| --- | --- | --- |
| `npm run dev` | racine | Serveur de développement du site |
| `npm run build` | racine | Build de production du site |
| `npm run typecheck` | racine | Vérification des types du site |
| `npm run dev` | `server/` | API avec rechargement automatique |
| `npm run typecheck` | `server/` | Vérification des types de l'API |
| `npm run db:generate` | `server/` | Génère une migration après un changement de `src/db/schema.ts` |
| `npm run db:migrate` | `server/` | Applique les migrations |
| `npm run db:seed` | `server/` | Charge les méthodes de vente de départ |

## Mise en ligne

Le guide pas à pas (Neon, Render, Vercel, Resend, Turnstile) est dans [DEPLOIEMENT.md](DEPLOIEMENT.md). Le code est prêt : limitation de requêtes, en-têtes de sécurité, confirmation d'email (Resend) et anti-robots (Turnstile) s'activent dès que leurs clés sont renseignées.
