# Chariow Radar

Application de repérage et d'analyse des produits digitaux vendus sur [Chariow](https://chariow.com). Elle permet d'enregistrer les produits, de les classer par trafic généré et d'identifier les méthodes de vente (Facebook Ads, TikTok, email, affiliation…) qui performent le mieux.

## Fonctionnalités

- **Classement** : liste des produits avec recherche, filtre par catégorie et tri (trafic, ventes, note, récent)
- **Fiche produit** : détail d'un produit et des méthodes de vente associées
- **Repérer** : formulaire d'ajout d'un produit
- **Analyses** : classement des méthodes de vente par contribution au trafic

## Stack

React 18, TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL), lucide-react.

## Installation

```bash
npm install
cp .env.example .env
```

Renseigne ensuite dans `.env` les valeurs de ton projet Supabase (Project Settings, puis API) :

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Le fichier `.env` est ignoré par git : ne le commite jamais.

### Base de données

Exécute le script `supabase/migrations/20261021215040_create_chariow_tracker_schema.sql` dans l'éditeur SQL de Supabase. Il crée les tables `products`, `sales_methods` et `product_methods` et insère 12 méthodes de vente par défaut.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | Linter |
| `npm run typecheck` | Vérification des types |

## Sécurité

Les règles RLS actuelles autorisent la lecture et l'écriture à tout le monde. À restreindre avant toute mise en ligne publique.
