/**
 * Loads "最新消息" entries for the homepage.
 *
 * Source of truth: the same `ai_faq` table the chatbot uses. Admins flag a
 * FAQ row for the homepage by setting `news_published_at`. Posts auto-expire
 * once `news_expires_at` passes — no cron job required.
 */

import { unstable_cache } from "next/cache";
import { supabaseAnon } from "@/lib/supabase/server";

export type NewsItem = {
    id: string;
    category: string;
    /** Headline shown on the card — admin's news_title, falling back to question. */
    title: string;
    /** First ~200 chars of the FAQ answer, plain text (markdown stripped). */
    snippet: string;
    /** ISO date string. */
    publishedAt: string;
    /** ISO date string or null. */
    expiresAt: string | null;
};

const HOMEPAGE_NEWS_LIMIT = 6;

type RawRow = {
    id: string;
    category: string;
    question: string;
    answer: string;
    news_title: string | null;
    news_published_at: string;
    news_expires_at: string | null;
};

/** Very lightweight markdown → plain text for card previews. */
function toSnippet(answer: string, max = 200): string {
    return answer
        .replace(/\*\*(.+?)\*\*/g, "$1")    // **bold**
        .replace(/\*(.+?)\*/g, "$1")        // *italic*
        .replace(/`([^`]+)`/g, "$1")        // `code`
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
        .replace(/^#+\s*/gm, "")            // # heading
        .replace(/^[-*]\s+/gm, "・")        // - bullet → ・
        .replace(/\n+/g, " ")               // newlines → spaces
        .replace(/\s+/g, " ")               // collapse whitespace
        .trim()
        .slice(0, max);
}

async function fetchActiveNewsUncached(): Promise<NewsItem[]> {
    const sb = supabaseAnon();
    const nowIso = new Date().toISOString();

    // "Active": admin posted it AND it hasn't expired yet. The DB-side filter
    // means an expired post stops appearing automatically — no maintenance.
    const { data, error } = await sb
        .from("ai_faq")
        .select(
            "id, category, question, answer, news_title, news_published_at, news_expires_at",
        )
        .eq("enabled", true)
        .not("news_published_at", "is", null)
        .or(`news_expires_at.is.null,news_expires_at.gt.${nowIso}`)
        .order("news_published_at", { ascending: false })
        .limit(HOMEPAGE_NEWS_LIMIT);

    if (error) {
        console.error("[news] failed to load homepage news:", error);
        return [];
    }

    const rows = (data ?? []) as RawRow[];
    return rows.map((r) => ({
        id: r.id,
        category: r.category || "一般",
        title: r.news_title?.trim() || r.question,
        snippet: toSnippet(r.answer),
        publishedAt: r.news_published_at,
        expiresAt: r.news_expires_at,
    }));
}

/**
 * 5-minute cache. Admin edit actions (`createFaq`, `updateFaq`, etc.) call
 * `revalidatePath("/")` so changes show up immediately, but for everyone else
 * this avoids a Supabase round-trip on every homepage hit.
 */
export const getHomepageNews = unstable_cache(
    fetchActiveNewsUncached,
    ["homepage_news_v1"],
    { revalidate: 5 * 60, tags: ["ai_faq_knowledge"] },
);
