-- Extend ai_faq so admins can also surface a FAQ entry as a news card on the
-- homepage (「最新消息」). Posts auto-expire by date — no cron required.

alter table public.ai_faq
    add column if not exists news_title         text,
    add column if not exists news_published_at  timestamptz,
    add column if not exists news_expires_at    timestamptz;

-- An "active news post" means:
--   news_published_at IS NOT NULL
--   AND news_expires_at IS NULL OR news_expires_at > now()
-- We index on news_published_at so the homepage query stays fast even with
-- thousands of FAQ rows.
create index if not exists ai_faq_news_active_idx
    on public.ai_faq (news_published_at desc)
    where news_published_at is not null;

comment on column public.ai_faq.news_title is
    '選填的新聞標題；為空時用 question 當標題顯示在首頁最新消息。';
comment on column public.ai_faq.news_published_at is
    '有值代表此 FAQ 已被選為首頁最新消息；為 null 代表從未上架或永久下架。';
comment on column public.ai_faq.news_expires_at is
    '到此時間後自動從首頁最新消息消失（不需要 cron）。';
