-- ── 安全修正：只處理會弄壞 URL 的 slug ──────────────────────────────
-- /destinations/{slug} 是 Next.js dynamic route，slug 內不該包含空格或
-- 大小寫混雜，否則會被 URL-encode 成 %20、或導致 static params 與前端
-- 連結不一致。
--
-- 這個 migration 只更新 *實際有問題* 的列，不會動到其他 slug。
-- 任何已連結這些分類的 tours（tour_categories 指向同一個 category.id）
-- 完全不受影響——我們只改 slug 字串而已。

-- 1. 文化體驗：URL 不能有空格
UPDATE public.categories
SET    slug = 'cultural-experience'
WHERE  type = 'region'
  AND  slug = 'cultural experience';

-- 2. 摩洛哥：URL 一律小寫
UPDATE public.categories
SET    slug = 'morocco'
WHERE  type = 'region'
  AND  slug = 'Morocco';
