-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: allow browser uploads for the `site-assets` Storage bucket.
--
-- Symptoms:
--   Admin UI (SiteImageUploader) uploads to bucket `site-assets` using the anon
--   key (supabaseBrowser()). Without explicit storage.objects policies for this
--   bucket, uploads can fail with HTTP 400 ("new row violates row-level security
--   policy") or similar.
--
-- Notes:
--   We intentionally allow anon + authenticated here because the admin panel is
--   protected at the Next.js layer, but storage RLS still needs to permit the
--   upload operation itself.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow public reads from site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from site-assets" ON storage.objects;

CREATE POLICY "Allow public reads from site-assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-assets');

CREATE POLICY "Allow uploads to site-assets"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "Allow updates to site-assets"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'site-assets')
  WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "Allow deletes from site-assets"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'site-assets');

