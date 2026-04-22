-- ── Site-wide settings (hero, logo, contact banner, …) ──────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
    key         TEXT PRIMARY KEY,
    value       TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the three keys we need.  ON CONFLICT so re-running is safe.
INSERT INTO site_settings (key, value) VALUES
    ('hero_image',            NULL),
    ('logo_image',            NULL),
    ('contact_banner_image',  NULL)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (including public visitors) can read.
CREATE POLICY "Public read site_settings"
    ON site_settings FOR SELECT USING (true);
-- Writes only happen via service-role (server actions) which bypasses RLS.

-- ── site-assets bucket (public, for hero / logo / banners) ──────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public read site-assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'site-assets');

-- Anon / authenticated upload (browser client uses anon key)
CREATE POLICY "Anon upload site-assets"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "Anon update site-assets"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'site-assets');

CREATE POLICY "Anon delete site-assets"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'site-assets');
