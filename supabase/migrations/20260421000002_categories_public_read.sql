-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: let anon (public, not-logged-in users) read from `categories`.
--
-- Why:
--   初始 schema 的註解寫著「public 可讀 categories」，但那條 policy 其實是
--   建在 `tour_categories` 上（拼錯表名）。結果 `categories` 表只有一條
--   admin FOR ALL 的 policy，anon 完全讀不到，導致：
--     /destinations/<slug> 先用 categories.slug 去查 id 時拿不到資料，
--     進而 tour_categories 那一串查不到，畫面一直顯示「行程資料整理中」。
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "public can read categories" ON public.categories;

CREATE POLICY "public can read categories"
ON public.categories
FOR SELECT
USING (true);
