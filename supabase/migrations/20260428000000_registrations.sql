-- ─────────────────────────────────────────────────────────────────────────────
-- "報名" feature: per-tour capacity + customer registration submissions.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Per-tour capacity setting. NULL means "no cap, never goes full".
alter table public.tours
    add column if not exists max_attendees integer
        check (max_attendees is null or max_attendees > 0);

-- 2. Customer registrations.
--   * Anyone (anon) can INSERT (so the public form works).
--   * Reading rows must go through the service role (admin only) — we do NOT
--     add a SELECT policy for anon.
create table if not exists public.registrations (
    id uuid primary key default gen_random_uuid(),
    tour_id uuid not null references public.tours(id) on delete cascade,
    -- Snapshot of the tour title at submit time.
    tour_title text,

    -- Lead traveler )/ 代表報名人 (full passport-level details).
    last_name_zh   text not null,
    first_name_zh  text not null,
    last_name_en   text not null,   -- e.g. CHEN (passport romanization)
    first_name_en  text not null,   -- e.g. MEI-LING
    gender         text,            -- 'male' | 'female' | 'other'
    birthday       date,
    national_id    text,            -- 身分證字號 (Taiwan)
    passport_no    text not null,
    passport_expiry date,
    phone          text not null,
    email          text not null,
    address        text,

    -- Group info.
    party_size       integer not null default 1 check (party_size >= 1),
    room_preference  text,           -- 'single' | 'double' | 'triple'
    dietary          text,           -- e.g. '素食 / 不吃牛'
    special_requests text,

    -- Emergency contact.
    emergency_name      text,
    emergency_relation  text,
    emergency_phone     text,

    -- Consents.
    agreed_privacy   boolean not null default false,
    agreed_terms     boolean not null default false,
    agreed_marketing boolean not null default false,

    -- Lifecycle: pending (just submitted) → confirmed (admin accepted) →
    -- cancelled. Capacity counts everything except 'cancelled'.
    status text not null default 'pending'
        check (status in ('pending', 'confirmed', 'cancelled')),

    created_at timestamptz not null default now()
);

create index if not exists registrations_tour_status_idx
    on public.registrations (tour_id, status);

alter table public.registrations enable row level security;

drop policy if exists "anyone can insert registration" on public.registrations;
create policy "anyone can insert registration"
    on public.registrations
    for insert
    to anon, authenticated
    with check (true);
