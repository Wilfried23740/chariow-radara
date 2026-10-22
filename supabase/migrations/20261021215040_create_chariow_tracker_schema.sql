/*
# Création du schéma Chariow Tracker

## Objectif
Application pour repérer et suivre les meilleurs produits digitaux vendus sur Chariow,
et identifier les méthodes de vente qui génèrent le plus de trafic.

## Nouvelles tables

1. `products` — Produits digitaux repérés sur Chariow
   - id (uuid, PK)
   - title (text) — nom du produit
   - creator (text) — nom du créateur/vendeur
   - description (text) — description du produit
   - category (text) — catégorie (ebook, formation, logiciel, template, coaching, bundle, audio, video, design)
   - price (numeric) — prix du produit
   - currency (text, default 'USD') — devise
   - image_url (text) — URL de l'image/aperçu
   - chariow_url (text) — lien vers la boutique Chariow
   - traffic_score (integer, default 0) — score de trafic estimé (0-100)
   - sales_estimate (integer, default 0) — nombre de ventes estimé
   - rating (numeric, default 0) — note moyenne (0-5)
   - tags (text[]) — étiquettes
   - spotted_at (timestamptz) — date de repérage
   - created_at, updated_at (timestamptz)

2. `sales_methods` — Méthodes de vente/marketing utilisées
   - id (uuid, PK)
   - name (text) — nom de la méthode (ex: Facebook Ads, TikTok, Email marketing)
   - category (text) — type (paid, organic, email, partnership, webinar, affiliate)
   - icon (text) — nom d'icône lucide
   - description (text)
   - created_at (timestamptz)

3. `product_methods` — Table de liaison produit <-> méthode de vente
   - id (uuid, PK)
   - product_id (uuid, FK -> products)
   - method_id (uuid, FK -> sales_methods)
   - traffic_contribution (integer) — % de trafic apporté par cette méthode (0-100)
   - notes (text) — observations
   - created_at (timestamptz)

## Sécurité
- RLS activée sur toutes les tables.
- Application mono-utilisateur sans authentification : politiques ouvertes à `anon, authenticated`.

## Données initiales
- Méthodes de vente pré-configurées (Facebook Ads, TikTok, WhatsApp, Email, YouTube, SEO, Influenceurs, Webinaires, Marketing d'affiliation, Instagram).
- Catégories de produits via contrainte CHECK.
*/

-- ============================================
-- Table: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  creator text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL CHECK (
    category IN ('ebook', 'formation', 'logiciel', 'template', 'coaching', 'bundle', 'audio', 'video', 'design', 'autre')
  ),
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  image_url text DEFAULT '',
  chariow_url text DEFAULT '',
  traffic_score integer NOT NULL DEFAULT 0 CHECK (traffic_score >= 0 AND traffic_score <= 100),
  sales_estimate integer NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  tags text[] DEFAULT '{}',
  spotted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_traffic_score ON products(traffic_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_spotted_at ON products(spotted_at DESC);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- Table: sales_methods
-- ============================================
CREATE TABLE IF NOT EXISTS sales_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (
    category IN ('paid', 'organic', 'email', 'partnership', 'webinar', 'affiliate', 'social')
  ),
  icon text NOT NULL DEFAULT 'TrendingUp',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_methods" ON sales_methods;
CREATE POLICY "anon_select_methods" ON sales_methods FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_methods" ON sales_methods;
CREATE POLICY "anon_insert_methods" ON sales_methods FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_methods" ON sales_methods;
CREATE POLICY "anon_update_methods" ON sales_methods FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_methods" ON sales_methods;
CREATE POLICY "anon_delete_methods" ON sales_methods FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- Table: product_methods
-- ============================================
CREATE TABLE IF NOT EXISTS product_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  method_id uuid NOT NULL REFERENCES sales_methods(id) ON DELETE CASCADE,
  traffic_contribution integer NOT NULL DEFAULT 0 CHECK (traffic_contribution >= 0 AND traffic_contribution <= 100),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, method_id)
);

CREATE INDEX IF NOT EXISTS idx_pm_product_id ON product_methods(product_id);
CREATE INDEX IF NOT EXISTS idx_pm_method_id ON product_methods(method_id);

ALTER TABLE product_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pm" ON product_methods;
CREATE POLICY "anon_select_pm" ON product_methods FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pm" ON product_methods;
CREATE POLICY "anon_insert_pm" ON product_methods FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pm" ON product_methods;
CREATE POLICY "anon_update_pm" ON product_methods FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pm" ON product_methods;
CREATE POLICY "anon_delete_pm" ON product_methods FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- Données initiales: méthodes de vente
-- ============================================
INSERT INTO sales_methods (name, category, icon, description) VALUES
  ('Facebook Ads', 'paid', 'Facebook', 'Publicités payantes sur Facebook et Instagram pour cibler des audiences spécifiques'),
  ('TikTok (organique)', 'organic', 'Music', 'Contenu viral court-format sur TikTok pour générer du trafic naturel'),
  ('WhatsApp Business', 'social', 'MessageCircle', 'Marketing direct via WhatsApp : listes de diffusion, statuts, conversations'),
  ('Email Marketing', 'email', 'Mail', 'Séquences d''emails et newsletters pour nurturing et conversion'),
  ('YouTube', 'organic', 'Youtube', 'Tutoriels, démos et contenu éducatif pour attirer et convaincre'),
  ('SEO / Blog', 'organic', 'Search', 'Optimisation du référencement et articles de blog pour trafic organique'),
  ('Influenceurs', 'partnership', 'Users', 'Partenariats avec des créateurs de contenu pour promotion'),
  ('Webinaires', 'webinar', 'Video', 'Sessions en direct pour démontrer la valeur et convertir'),
  ('Marketing d''affiliation', 'affiliate', 'Share2', 'Programme où des partenaires promeuvent le produit contre commission'),
  ('Instagram', 'social', 'Instagram', 'Reels, stories et posts pour engagement et trafic'),
  ('Telegram', 'social', 'Send', 'Canaux et groupes Telegram pour diffusion de masse'),
  ('Google Ads', 'paid', 'Search', 'Publicités sur le réseau de recherche et display Google')
ON CONFLICT (name) DO NOTHING;
