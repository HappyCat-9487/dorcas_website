-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: rename destination hero image keys for Taiwan sub-regions.
--
-- Before: regionDropdowns used /destinations/taiwan-{slug}  (e.g. taiwan-central)
--         → site_settings keys were  destination_hero_taiwan-central
-- After:  regionDropdowns now use  /destinations/{slug}     (e.g. central)
--         → site_settings keys are  destination_hero_central
--
-- Images in storage are untouched; we only rename the key in site_settings
-- so the frontend can find them again.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.site_settings
SET    key = REPLACE(key, 'destination_hero_taiwan-', 'destination_hero_')
WHERE  key LIKE 'destination_hero_taiwan-%';
