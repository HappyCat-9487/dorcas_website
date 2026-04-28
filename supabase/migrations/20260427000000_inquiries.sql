-- Customer-facing inquiry submissions from the "行程諮詢" form on tour pages.
-- Public can INSERT (so the form works for anonymous visitors), but only the
-- service role can READ them back, to avoid leaking customer PII.

create table if not exists public.inquiries (
    id            uuid primary key default gen_random_uuid(),
    tour_id       uuid references public.tours(id) on delete set null,
    -- Snapshot of the tour title at submit time, useful when a tour is later
    -- renamed or deleted: we still know what they asked about.
    tour_title    text,
    name          text not null,
    phone         text,
    email         text,
    message       text,
    agreed_privacy boolean not null default false,
    created_at    timestamptz not null default now()
);

alter table public.inquiries enable row level security;

drop policy if exists "anyone can insert inquiry" on public.inquiries;
create policy "anyone can insert inquiry"
    on public.inquiries
    for insert
    to anon, authenticated
    with check (true);

-- We deliberately do NOT add a SELECT policy for anon.
-- Reading inquiries should only happen via the service role (admin).
