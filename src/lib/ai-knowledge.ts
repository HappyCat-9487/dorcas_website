/**
 * Fetches the admin-maintained FAQ knowledge base from Supabase and renders it
 * as a text block to be injected into the AI's system prompt.
 *
 * Cached for 5 minutes so that high-frequency chat traffic doesn't hammer the
 * DB, but admin edits still propagate quickly (next 5 min).
 */

import { unstable_cache } from "next/cache";
import { supabaseAnon } from "@/lib/supabase/server";

const KNOWLEDGE_CACHE_TAG = "ai_faq_knowledge";

type FaqRow = {
    category: string;
    question: string;
    answer: string;
    sort_order: number;
};

async function fetchFaqRowsUncached(): Promise<FaqRow[]> {
    const sb = supabaseAnon();
    const { data, error } = await sb
        .from("ai_faq")
        .select("category, question, answer, sort_order")
        .eq("enabled", true)
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Failed to load ai_faq:", error.message);
        return [];
    }
    return (data ?? []) as FaqRow[];
}

const fetchFaqRows = unstable_cache(fetchFaqRowsUncached, ["ai-faq-rows"], {
    revalidate: 300, // 5 minutes
    tags: [KNOWLEDGE_CACHE_TAG],
});

/**
 * Render the FAQ table as a clean section for the system prompt.
 * Empty result → empty string (caller can ignore).
 */
export async function getKnowledgeBaseText(): Promise<string> {
    const rows = await fetchFaqRows();
    if (rows.length === 0) return "";

    const byCategory = rows.reduce<Record<string, FaqRow[]>>((acc, r) => {
        const key = r.category || "一般";
        (acc[key] ||= []).push(r);
        return acc;
    }, {});

    const parts: string[] = [];
    parts.push("══════════════════════════════════════");
    parts.push("旅遊知識庫（由多加旅遊維護的標準答案）");
    parts.push("══════════════════════════════════════");
    parts.push(
        "下列是我們經過核實的標準答案。當客人問題與下列任何一條相關時，請以這裡的答案為準，再用自己的話補充細節，不要硬背原文。如客人問題不在下表，再用你自己的旅遊常識回答。",
    );
    parts.push("");

    for (const cat of Object.keys(byCategory)) {
        parts.push(`【${cat}】`);
        for (const r of byCategory[cat]) {
            parts.push(`Q：${r.question}`);
            parts.push(`A：${r.answer}`);
            parts.push("");
        }
    }
    return parts.join("\n");
}
