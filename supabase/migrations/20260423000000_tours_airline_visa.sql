-- ─────────────────────────────────────────────────────────────────────────────
-- Add `airline` and `visa` columns to tours.
--
-- These back the "航空公司" and "簽證" columns on the public /tours/[slug]
-- departure-info tab as well as the /groups (出團一覽表) overview page.
--
-- Both are free-form text so the admin can write things like:
--   airline: "長榮航空" / "長榮 / 中華" / "全日空 NH"
--   visa:    "免簽" / "落地簽" / "電子簽 (約 NT$ 1,800)"
-- Industry conventions in Taiwan travel agencies (easyTravel / KKday /
-- Lion Travel / Cola Tour) all use short free-form strings here.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.tours
    ADD COLUMN IF NOT EXISTS airline text,
    ADD COLUMN IF NOT EXISTS visa    text;
