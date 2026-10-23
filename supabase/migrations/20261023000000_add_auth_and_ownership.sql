/*
# Authentification et propriété des produits

## Objectif
Application multi-utilisateurs : tout le monde peut consulter les données sans
connexion, mais seuls les utilisateurs connectés peuvent ajouter des produits,
et chacun ne peut modifier ou supprimer que ses propres produits.

## Changements
- `products.user_id` : propriétaire du produit (rempli automatiquement avec auth.uid()).
  Les produits existants ont `user_id` NULL : ils restent visibles mais personne
  ne peut les modifier depuis l'application.
- Remplacement des politiques RLS ouvertes à tous par des politiques restrictives.

## Sécurité
- products : lecture publique ; insertion/modification/suppression réservées au propriétaire.
- product_methods : lecture publique ; écriture réservée au propriétaire du produit lié.
- sales_methods : lecture publique ; aucune écriture depuis l'application
  (catalogue géré depuis le tableau de bord Supabase).
*/

-- ============================================
-- products : propriétaire
-- ============================================
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

DROP POLICY IF EXISTS "anon_select_products" ON products;
DROP POLICY IF EXISTS "anon_insert_products" ON products;
DROP POLICY IF EXISTS "anon_update_products" ON products;
DROP POLICY IF EXISTS "anon_delete_products" ON products;

DROP POLICY IF EXISTS "products_select_public" ON products;
CREATE POLICY "products_select_public" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "products_insert_own" ON products;
CREATE POLICY "products_insert_own" ON products FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "products_update_own" ON products;
CREATE POLICY "products_update_own" ON products FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "products_delete_own" ON products;
CREATE POLICY "products_delete_own" ON products FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- ============================================
-- sales_methods : lecture seule
-- ============================================
DROP POLICY IF EXISTS "anon_select_methods" ON sales_methods;
DROP POLICY IF EXISTS "anon_insert_methods" ON sales_methods;
DROP POLICY IF EXISTS "anon_update_methods" ON sales_methods;
DROP POLICY IF EXISTS "anon_delete_methods" ON sales_methods;

DROP POLICY IF EXISTS "methods_select_public" ON sales_methods;
CREATE POLICY "methods_select_public" ON sales_methods FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================
-- product_methods : écriture réservée au propriétaire du produit
-- ============================================
DROP POLICY IF EXISTS "anon_select_pm" ON product_methods;
DROP POLICY IF EXISTS "anon_insert_pm" ON product_methods;
DROP POLICY IF EXISTS "anon_update_pm" ON product_methods;
DROP POLICY IF EXISTS "anon_delete_pm" ON product_methods;

DROP POLICY IF EXISTS "pm_select_public" ON product_methods;
CREATE POLICY "pm_select_public" ON product_methods FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "pm_insert_own" ON product_methods;
CREATE POLICY "pm_insert_own" ON product_methods FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "pm_update_own" ON product_methods;
CREATE POLICY "pm_update_own" ON product_methods FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "pm_delete_own" ON product_methods;
CREATE POLICY "pm_delete_own" ON product_methods FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.user_id = auth.uid())
  );
