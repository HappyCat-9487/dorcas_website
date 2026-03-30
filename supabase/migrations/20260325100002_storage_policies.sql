-- Migration: add upload/update/delete policies for the tour-assets Storage bucket
-- This allows the browser (anon key) to upload images to tour-assets

DROP POLICY IF EXISTS "Allow uploads to tour-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to tour-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from tour-assets" ON storage.objects;

-- Allow anyone to upload files into tour-assets
CREATE POLICY "Allow uploads to tour-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tour-assets');

-- Allow anyone to overwrite (upsert) existing files
CREATE POLICY "Allow updates to tour-assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tour-assets')
  WITH CHECK (bucket_id = 'tour-assets');

-- Allow anyone to delete files from tour-assets (needed for replacing images)
CREATE POLICY "Allow deletes from tour-assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tour-assets');
