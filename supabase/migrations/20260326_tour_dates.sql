-- Migration: replace date_label text field with proper start_date / end_date date columns
-- Also change price_from to store a numeric string (raw number, e.g. "179000")
-- Run in Supabase SQL Editor, then: supabase db push

ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date   date;

-- date_label is kept so existing data is not lost, but no longer used by the UI
