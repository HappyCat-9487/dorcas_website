/**
 * AI assistant tools (function calling).
 *
 * These are server-side helpers exposed to the OpenAI chat completion as
 * "tools". The AI decides when to call them; we execute them on the server
 * and feed the result back into the conversation.
 *
 * Important: we use the ANON Supabase client here on purpose — anything the
 * AI returns to the customer should respect the same RLS rules that public
 * pages use (e.g. only published tours).
 */

import { supabaseAnon } from "@/lib/supabase/server";
import {
    computeTripDays,
    todayISODateInTimeZone,
    TOUR_DATE_TZ,
} from "@/lib/tour-dates";

// ─────────────────────────────────────────────────────────────────────
// OpenAI tool schemas (sent to the API so the model knows what to call)
// ─────────────────────────────────────────────────────────────────────

export const AI_TOOLS = [
    {
        type: "function" as const,
        function: {
            name: "search_tours",
            description:
                "查詢多加旅遊目前已發佈的行程。可用關鍵字、日期、天數區間、目的地過濾。回傳前 10 筆，已依出發日期排序。當客人問『你們有什麼團』、『最近有 X 國的行程嗎』、『X 月有什麼團』時請呼叫此工具。",
            parameters: {
                type: "object",
                properties: {
                    keyword: {
                        type: "string",
                        description: "中文或英文關鍵字，例如 '東京'、'賞櫻'、'郵輪'。",
                    },
                    start: {
                        type: "string",
                        description: "YYYY-MM-DD，行程必須晚於或等於此日期出發。",
                    },
                    end: {
                        type: "string",
                        description: "YYYY-MM-DD，行程必須早於或等於此日期結束。",
                    },
                    duration: {
                        type: "string",
                        enum: ["short", "medium", "long"],
                        description:
                            "天數：short = 5 天以下、medium = 6–9 天、long = 10 天以上。",
                    },
                    destination_slug: {
                        type: "string",
                        description: `分類 slug。客人用中文時請對照下表轉成 slug：
台灣→taiwan, 北部→north, 中部→central, 南部→south, 東部→east, 離島→islands, 郵輪→cruise,
亞洲→asia, 日本→japan, 韓國→korea, 蒙古/俄羅斯→mongolia-russia, 東南亞→southeast-asia,
美洲→americas, 美國→usa, 加拿大→canada,
大洋洲→oceania, 澳洲→australia, 紐西蘭→new-zealand,
歐洲→europe, 北歐→northern-europe, 西歐→western-europe, 南歐→southern-europe, 東歐→eastern-europe,
非洲→africa, 北非→northern-africa, 摩洛哥→morocco, 東非→eastern-africa, 南非→southern-africa,
主題式→theme, 海島漫遊→island-hopping, 蜜月旅行→honeymoon, 冬季滑雪→winter-skiing, 文化體驗→cultural-experience, 櫻花季→sakura-season, 薰衣草季→lavender-season.
若不知道請省略。`,
                    },
                },
                required: [],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "get_tour_detail",
            description:
                "依 slug 取得單一行程的完整資料，含行程景點。當客人問『XX 團詳細行程』、『XX 團包含哪些景點』時請呼叫此工具。slug 通常是行程列表回傳的那個。",
            parameters: {
                type: "object",
                properties: {
                    slug: {
                        type: "string",
                        description: "行程的 slug，例如 'japan-cherry-blossom-2026'。",
                    },
                },
                required: ["slug"],
            },
        },
    },
];

// ─────────────────────────────────────────────────────────────────────
// Tool dispatcher (called from /api/chat)
// ─────────────────────────────────────────────────────────────────────

export async function runAiTool(
    name: string,
    args: Record<string, unknown>,
): Promise<unknown> {
    if (name === "search_tours") {
        return await searchTours({
            keyword: typeof args.keyword === "string" ? args.keyword : undefined,
            start:   typeof args.start   === "string" ? args.start   : undefined,
            end:     typeof args.end     === "string" ? args.end     : undefined,
            duration:
                args.duration === "short" || args.duration === "medium" || args.duration === "long"
                    ? args.duration
                    : undefined,
            destination_slug:
                typeof args.destination_slug === "string"
                    ? args.destination_slug
                    : undefined,
        });
    }
    if (name === "get_tour_detail") {
        return await getTourDetail({
            slug: typeof args.slug === "string" ? args.slug : "",
        });
    }
    return { error: `Unknown tool: ${name}` };
}

// ─────────────────────────────────────────────────────────────────────
// search_tours
// ─────────────────────────────────────────────────────────────────────

const KW_BAD_CHARS = /[,()%_*]/g;

type SearchToursArgs = {
    keyword?: string;
    start?: string;
    end?: string;
    duration?: "short" | "medium" | "long";
    destination_slug?: string;
};

async function searchTours(args: SearchToursArgs) {
    const sb = supabaseAnon();
    const kw = (args.keyword ?? "").replace(KW_BAD_CHARS, " ").trim();

    // Resolve destination slug → category id(s).
    // If the slug is a parent category (e.g. "asia"), also include all its
    // children (e.g. "japan", "korea", "southeast-asia") so the AI finds
    // tours categorized under sub-regions too.
    let categoryIds: string[] | null = null;
    if (args.destination_slug) {
        const { data: cat } = await sb
            .from("categories")
            .select("id")
            .eq("slug", args.destination_slug)
            .maybeSingle();
        if (!cat) {
            return {
                results: [],
                note: `找不到 destination_slug "${args.destination_slug}" 對應的分類。`,
            };
        }
        const parentId = cat.id as string;
        // Check for child categories under this parent.
        const { data: children } = await sb
            .from("categories")
            .select("id")
            .eq("parent_id", parentId);
        const childIds = (children ?? []).map((c) => c.id as string);
        categoryIds = [parentId, ...childIds];
    }

    // First pass: collect IDs that match the keyword across title/summary/stops.
    let idsFromKeyword: string[] | null = null;
    if (kw) {
        const [titlesRes, stopsRes] = await Promise.all([
            sb
                .from("tours")
                .select("id")
                .or(`title.ilike.%${kw}%,summary.ilike.%${kw}%`)
                .eq("status", "published"),
            sb
                .from("tour_stops")
                .select("tour_id")
                .or(`subtheme.ilike.%${kw}%,introduction.ilike.%${kw}%`),
        ]);
        const titleHits = (titlesRes.data ?? []).map((r) => r.id as string);
        const stopHits  = (stopsRes.data ?? []).map((r) => r.tour_id as string);
        idsFromKeyword  = [...new Set([...titleHits, ...stopHits])];
        if (idsFromKeyword.length === 0) {
            return { results: [], note: `找不到包含「${kw}」的行程。` };
        }
    }

    // Main query.
    let q = sb
        .from("tours")
        .select(
            `
            id, title, slug, summary, price_from,
            start_date, end_date, airline, visa,
            tour_categories!inner ( category_id )
            `,
        )
        .eq("status", "published");

    const today = todayISODateInTimeZone(TOUR_DATE_TZ);
    // Hide tours that already departed.
    q = q.gte("end_date", today);

    if (categoryIds) q = q.in("tour_categories.category_id", categoryIds);
    if (args.start) q = q.gte("start_date", args.start);
    if (args.end)   q = q.lte("end_date",   args.end);
    if (idsFromKeyword) q = q.in("id", idsFromKeyword);

    const { data, error } = await q
        .order("start_date", { ascending: true })
        .limit(20);

    if (error) return { error: error.message, results: [] };

    // Dedupe (inner join may duplicate) + filter by duration in JS.
    const seen = new Set<string>();
    const rows = (data ?? []).filter((r) => {
        if (seen.has(r.id as string)) return false;
        seen.add(r.id as string);
        return true;
    });

    const results = rows
        .map((r) => {
            const days = computeTripDays(
                r.start_date as string | null,
                r.end_date as string | null,
            );
            return {
                title: r.title,
                slug: r.slug,
                summary: r.summary,
                start_date: r.start_date,
                end_date: r.end_date,
                days,
                airline: r.airline,
                visa: r.visa,
                price_from: r.price_from,
                // Leave the slug un-encoded so the AI prints clean Chinese
                // links like /tours/北義大利之旅. The browser & Next.js
                // <Link> handle URL-encoding automatically when navigating.
                url: `/tours/${r.slug}`,
            };
        })
        .filter((r) => {
            if (!args.duration || r.days === null) return true;
            if (args.duration === "short")  return r.days <= 5;
            if (args.duration === "medium") return r.days >= 6 && r.days <= 9;
            if (args.duration === "long")   return r.days >= 10;
            return true;
        })
        .slice(0, 10);

    return {
        count: results.length,
        results,
        hint:
            results.length === 0
                ? "目前沒有符合條件的行程；可以建議客人放寬條件，或來電 / LINE 諮詢。"
                : "請用條列式整理給客人，並附上每團的網址 (url) 讓客人點擊。",
    };
}

// ─────────────────────────────────────────────────────────────────────
// get_tour_detail
// ─────────────────────────────────────────────────────────────────────

async function getTourDetail({ slug }: { slug: string }) {
    if (!slug) return { error: "slug is required" };

    const sb = supabaseAnon();
    const { data: tour, error } = await sb
        .from("tours")
        .select(
            `
            id, title, slug, summary, price_from,
            start_date, end_date, airline, visa, max_attendees, status
            `,
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

    if (error) return { error: error.message };
    if (!tour) return { error: `找不到 slug = "${slug}" 已經發佈的行程` };

    const { data: stops } = await sb
        .from("tour_stops")
        .select("sort_order, subtheme, introduction")
        .eq("tour_id", tour.id)
        .order("sort_order", { ascending: true });

    return {
        title: tour.title,
        slug: tour.slug,
        summary: tour.summary,
        start_date: tour.start_date,
        end_date: tour.end_date,
        days: computeTripDays(
            tour.start_date as string | null,
            tour.end_date as string | null,
        ),
        airline: tour.airline,
        visa: tour.visa,
        price_from: tour.price_from,
        url: `/tours/${tour.slug}`,
        stops:
            stops?.map((s) => ({
                order: s.sort_order,
                name: s.subtheme,
                introduction: s.introduction,
            })) ?? [],
        hint: "請依客人問題重點挑選資訊回答，景點介紹太長時可摘要。最後附上 url 讓客人查看完整頁面。",
    };
}
