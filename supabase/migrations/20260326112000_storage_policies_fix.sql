-- Migration: fix Storage policies for tour-assets uploads (anon + authenticated)
-- Reason: browser uploads use the anon key → role = anon, which must be allowed explicitly.

-- Recreate policies idempotently
DROP POLICY IF EXISTS "Allow uploads to tour-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to tour-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from tour-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from tour-assets" ON storage.objects;

-- Public read (in case bucket isn't set to Public, this still allows reads)
CREATE POLICY "Allow public reads from tour-assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'tour-assets');

-- Allow anon + authenticated to upload/update/delete in this bucket
CREATE POLICY "Allow uploads to tour-assets"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'tour-assets');

CREATE POLICY "Allow updates to tour-assets"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'tour-assets')
  WITH CHECK (bucket_id = 'tour-assets');

CREATE POLICY "Allow deletes from tour-assets"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'tour-assets');

