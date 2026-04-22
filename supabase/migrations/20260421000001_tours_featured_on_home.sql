-- ── Allow admins to promote a tour to the homepage ──────────────────────────
-- Homepage "行程精選" shows featured tours first; if fewer than 3 featured
-- tours are published, the homepage fills the remaining slots with the
-- next-earliest published tours (ordered by start_date, then updated_at).

ALTER TABLE public.tours
    ADD COLUMN IF NOT EXISTS featured_on_home boolean NOT NULL DEFAULT false;

-- Helpful partial index for the homepage query (featured + published).
CREATE INDEX IF NOT EXISTS tours_featured_on_home_published_idx
    ON public.tours (featured_on_home, status)
    WHERE featured_on_home = true AND status = 'published';
