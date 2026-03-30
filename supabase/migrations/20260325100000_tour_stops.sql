-- Migration: add price_from + date_label to tours, create tour_stops table
-- Run this in the Supabase SQL Editor

-- 1. Add price and date range display fields to tours
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS price_from text,
  ADD COLUMN IF NOT EXISTS date_label text;

-- 2. New tour_stops table (structured itinerary stops replacing Markdown content)
CREATE TABLE IF NOT EXISTS public.tour_stops (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  tour_id      uuid        NOT NULL,
  sort_order   integer     NOT NULL DEFAULT 0,
  subtheme     text        NOT NULL,
  introduction text,
  image_path   text,
  icon_path    text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tour_stops_pkey PRIMARY KEY (id),
  CONSTRAINT tour_stops_tour_id_fkey FOREIGN KEY (tour_id)
    REFERENCES public.tours(id) ON DELETE CASCADE
);

-- 3. Enable Row Level Security (match pattern of other tables)
ALTER TABLE public.tour_stops ENABLE ROW LEVEL SECURITY;

-- Allow public read for published tour stops (join via tours)
DROP POLICY IF EXISTS "Public can read tour_stops for published tours" ON public.tour_stops;
CREATE POLICY "Public can read tour_stops for published tours"
  ON public.tour_stops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tours
      WHERE tours.id = tour_stops.tour_id
        AND tours.status = 'published'
    )
  );

-- Allow service role full access (admin operations use service role key)
DROP POLICY IF EXISTS "Service role has full access to tour_stops" ON public.tour_stops;
CREATE POLICY "Service role has full access to tour_stops"
  ON public.tour_stops FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- NOTE: After running this SQL, also create a Storage bucket manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a new bucket named: tour-assets
-- 3. Set it to PUBLIC
-- 4. Add the following storage policies:
--    - Public read: allow SELECT for all (anon)
--    - Authenticated/service write: allow INSERT, UPDATE, DELETE for service_role
