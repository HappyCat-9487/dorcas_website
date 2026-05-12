-- AI 諮詢知識庫：可由後台維護的 FAQ。
-- /api/chat 會把所有 enabled = true 的問答動態注入 system prompt，
-- 讓 AI 用我們提供的權威答案回覆客人（簽證、護照、行李、入境卡等等）。

create table if not exists public.ai_faq (
    id          uuid primary key default gen_random_uuid(),
    category    text not null default '一般',           -- e.g. 簽證 / 護照 / 行李 / 入境
    question    text not null,                          -- 客人會問的問題（或 keyword 提示）
    answer      text not null,                          -- 給 AI 的標準答案（可含 markdown）
    sort_order  int  not null default 0,                -- 同一 category 內的顯示順序
    enabled     boolean not null default true,          -- 暫時下架某條答案不刪掉
    notes       text,                                   -- 內部備註（不送給 AI）
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists ai_faq_enabled_idx
    on public.ai_faq (enabled, category, sort_order);

-- updated_at 自動更新
create or replace function public.set_ai_faq_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_ai_faq_updated_at on public.ai_faq;
create trigger trg_ai_faq_updated_at
    before update on public.ai_faq
    for each row
    execute function public.set_ai_faq_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────
-- 公開可讀（/api/chat 用 anon client 撈資料），只有 service role 可寫。
alter table public.ai_faq enable row level security;

drop policy if exists "anyone can read ai_faq" on public.ai_faq;
create policy "anyone can read ai_faq"
    on public.ai_faq
    for select
    to anon, authenticated
    using (true);

-- 不建 insert/update/delete 的 anon policy → 預設拒絕，只有 service role 能改。

-- ── Seed：把目前寫在程式碼裡的 FAQ 先灌進來 ─────────────────────────
insert into public.ai_faq (category, question, answer, sort_order) values
('護照', '護照效期要多久才能出國？',
 '出國時護照「剩餘效期」必須 **6 個月以上**（從回國日起算）。少數國家可放寬，但建議一律遵守 6 個月原則。',
 10),
('護照', '小孩第一次辦護照需要本人到場嗎？',
 '未滿 14 歲首次辦理護照需本人親至外交部領事事務局；已滿 14 歲可委託代辦。',
 20),
('護照', '護照在國外遺失怎麼辦？',
 '立即到當地警察局報案 → 持報案證明至駐外館處辦理「入國證明書」回國。',
 30),

('簽證', '日本要簽證嗎？',
 '台灣護照前往日本**免簽證**，可停留 90 天。',
 10),
('簽證', '韓國要簽證嗎？',
 '台灣護照前往韓國**免簽證**，可停留 90 天。',
 20),
('簽證', '歐洲申根區要簽證嗎？',
 '台灣護照前往歐洲申根區（法、德、義、西、瑞士、北歐等）**免簽證 90 天 / 180 天內**。2026 年起需事先申請 **ETIAS** 電子旅行授權（小額費用，線上申辦）。',
 30),
('簽證', '英國要簽證嗎？',
 '台灣護照前往英國**免簽證 6 個月**。2026 年起需事先申請 **ETA** 電子旅行授權。',
 40),
('簽證', '美國要簽證嗎？',
 '台灣護照前往美國**免簽證 90 天**，但需事先申請 **ESTA**（約 USD 21，線上申辦）。',
 50),
('簽證', '加拿大要簽證嗎？',
 '台灣護照前往加拿大**免簽證 6 個月**，需事先申請 **eTA**（約 CAD 7）。',
 60),
('簽證', '中國大陸要簽證嗎？',
 '需辦「**台胞證**」。',
 70),
('簽證', '澳洲、紐西蘭要簽證嗎？',
 '需事先申請電子旅行授權（**NZeTA** / **ETA**）。',
 80),

('入境卡', '日本入境卡怎麼填？',
 '日本入境時需填寫入境卡與海關申報單。**2024 年起可使用 Visit Japan Web 線上預先填寫**，到機場掃 QR Code 即可，省去手寫時間。建議出發前先註冊好。',
 10),
('入境卡', '韓國入境卡怎麼填？',
 '韓國入境需填寫入境卡與海關申報單，會在機上發放。**2024 年起部分國家適用 K-ETA 免填**，但台灣旅客目前仍需填紙本入境卡。',
 20),
('入境卡', '泰國要填入境卡嗎？',
 '泰國於 **2024 年起取消入境卡（TM6）**！短期觀光旅客已不需再填寫紙本入境卡。但仍需在抵達時通過自助通關或人工查驗。',
 30),
('入境卡', '美國要填入境卡嗎？',
 '美國已**廢除紙本 I-94 入境卡**，所有資料電子化由海關自動產生。但仍可能需要填寫海關申報單（CBP Form 6059B）。',
 40),
('入境卡', '歐洲申根區要填入境卡嗎？',
 '申根區一般**不需要填紙本入境卡**，海關直接蓋章即可。',
 50),

('行李', '經濟艙可以託運多少行李？',
 '一般經濟艙託運行李為 **23kg × 1～2 件**（依航空公司不同）。出發前請以航空公司公告為準。',
 10),
('行李', '手提行李有什麼限制？',
 '手提行李一般限制：**重量 7kg、長寬高總和不超過 115cm**，且每人 1 件。',
 20),
('行李', '行動電源能不能託運？',
 '**不能！** 鋰電池與行動電源只能放手提行李、不能託運。容量上限通常 100Wh，超過需事先向航空公司申請。',
 30),
('行李', '液體可以帶上飛機嗎？',
 '手提行李液體 / 膏狀物：**單瓶 100ml 以下**，全部放入 **1 公升透明夾鏈袋**。託運行李則無此限制。',
 40),

('保險', '出國要買旅遊保險嗎？',
 '強烈建議投保 **「旅遊平安險 + 旅遊不便險 + 海外醫療險」三合一**。信用卡刷團費送的保險通常只涵蓋「公共運輸期間」，建議另保。',
 10),
('保險', '海外就醫怎麼申請理賠？',
 '請保留收據、診斷證明**正本**，回國 **90 天內**向保險公司申請理賠。',
 20),

('行程', '報名後可以取消嗎？退費規則？',
 '依「**國外旅遊定型化契約**」規定，越接近出發日，可退費比例越低（出發前 1 日內可能無法退費）。詳細條款以契約為準，具體請聯絡客服。',
 10),
('行程', '遇到天災或政變怎麼辦？',
 '旅行社會盡力協助調整，但相關費用可能依航空公司 / 飯店規定處理。建議出發前購買旅遊不便險。',
 20),

('機場', '國際線要提前多久到機場？',
 '建議**提前 3 小時**抵達機場。國內線提前 2 小時即可。',
 10),

('匯兌', '出國前要先換現金嗎？',
 '建議在台灣銀行先換好少量現金，當地大額消費刷信用卡較划算。**日本、韓國**便利商店多接受信用卡與行動支付（LINE Pay、Apple Pay）。**歐洲**建議備少量歐元現金，部分小店或廁所只收現金。',
 10),

('天氣', '日本櫻花季什麼時候？',
 '**3 月底～4 月中**（東京、京都），北海道 5 月初。建議提早 3–6 個月訂行程。',
 10),
('天氣', '北歐極光季什麼時候？',
 '**9 月～3 月**。建議準備防風防水羽絨外套、雪靴、暖暖包。',
 20),
('天氣', '東南亞氣候如何？',
 '泰、越、新馬全年高溫，**5～10 月為雨季**，建議避開或備好雨具。',
 30)
on conflict do nothing;
