"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseService } from "@/lib/supabase/server";

/**
 * Bust caches that depend on the FAQ table:
 *   - /admin/ai-faq        (admin list page)
 *   - /                    (homepage 最新消息 section)
 *   - tag ai_faq_knowledge (AI chat system prompt)
 */
function bustAllFaqCaches() {
    revalidatePath("/admin/ai-faq");
    revalidatePath("/");
    // Next.js 16 requires a second options argument; empty object = defaults.
    revalidateTag("ai_faq_knowledge", {});
}

/** Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" → ISO string, or null if empty. */
function parseLocalDate(raw: string): string | null {
    const v = raw.trim();
    if (!v) return null;
    // Accept date-only ("2026-06-13") and treat as end of day in Taiwan TZ so
    // a 6/13 expiry actually lasts through 6/13.
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        return new Date(`${v}T23:59:59+08:00`).toISOString();
    }
    const d = new Date(v);
    if (isNaN(d.getTime())) {
        throw new Error("下架日期格式不正確。");
    }
    return d.toISOString();
}

/**
 * Read the news-related fields from the admin form.
 *
 * Behavior:
 *  - "post_news" checkbox not checked → never published to news (both null).
 *  - "post_news" checked but `news_published_at` was previously set → keep
 *    the original publish time so the post doesn't appear to be "republished"
 *    every time the admin saves the FAQ.
 *  - Expiry default: 4 weeks from now if admin didn't pick one.
 */
function readNewsFields(
    form: FormData,
    existing: { news_published_at: string | null } | null,
): {
    news_title: string | null;
    news_published_at: string | null;
    news_expires_at: string | null;
} {
    const post = String(form.get("post_news") ?? "") === "on";
    const title = str(form, "news_title", 200) || null;

    if (!post) {
        // Clearing the checkbox removes the post from the homepage.
        return { news_title: title, news_published_at: null, news_expires_at: null };
    }

    // Keep the original publish time if it already existed.
    const publishedAt =
        existing?.news_published_at ?? new Date().toISOString();

    const expiresAtRaw = String(form.get("news_expires_at") ?? "").trim();
    const expiresAt = expiresAtRaw
        ? parseLocalDate(expiresAtRaw)
        : new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000).toISOString();

    return {
        news_title: title,
        news_published_at: publishedAt,
        news_expires_at: expiresAt,
    };
}

function str(form: FormData, key: string, max = 5000): string {
    const v = String(form.get(key) ?? "").trim();
    if (v.length > max) {
        throw new Error(`${key} 太長（上限 ${max} 字）。`);
    }
    return v;
}

function intOr(form: FormData, key: string, fallback: number): number {
    const raw = String(form.get(key) ?? "").trim();
    if (!raw) return fallback;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return fallback;
    return n;
}

export async function createFaq(formData: FormData) {
    const category   = str(formData, "category", 50) || "一般";
    const question   = str(formData, "question", 500);
    const answer     = str(formData, "answer", 5000);
    const sort_order = intOr(formData, "sort_order", 0);
    const notes      = str(formData, "notes", 2000) || null;
    const news       = readNewsFields(formData, null);

    if (!question) throw new Error("「問題」不能空白。");
    if (!answer)   throw new Error("「答案」不能空白。");

    const sb = supabaseService();
    const { error } = await sb
        .from("ai_faq")
        .insert({
            category, question, answer, sort_order, notes,
            enabled: true,
            ...news,
        });

    if (error) throw new Error(error.message);

    bustAllFaqCaches();
    redirect("/admin/ai-faq");
}

export async function updateFaq(formData: FormData) {
    const id = String(formData.get("id") ?? "").trim();
    if (!id) throw new Error("缺少 id。");

    const category   = str(formData, "category", 50) || "一般";
    const question   = str(formData, "question", 500);
    const answer     = str(formData, "answer", 5000);
    const sort_order = intOr(formData, "sort_order", 0);
    const notes      = str(formData, "notes", 2000) || null;
    const enabled    = String(formData.get("enabled") ?? "") === "on";

    if (!question) throw new Error("「問題」不能空白。");
    if (!answer)   throw new Error("「答案」不能空白。");

    const sb = supabaseService();

    // Look up the existing publish time so toggling "post_news" off-and-on
    // doesn't reset the publish date (preserves the original news age).
    const { data: existing } = await sb
        .from("ai_faq")
        .select("news_published_at")
        .eq("id", id)
        .maybeSingle();

    const news = readNewsFields(formData, existing ?? null);

    const { error } = await sb
        .from("ai_faq")
        .update({ category, question, answer, sort_order, notes, enabled, ...news })
        .eq("id", id);

    if (error) throw new Error(error.message);

    bustAllFaqCaches();
    redirect("/admin/ai-faq");
}

export async function toggleFaqEnabled(formData: FormData) {
    const id = String(formData.get("id") ?? "").trim();
    const nextEnabled = String(formData.get("next") ?? "") === "true";
    if (!id) throw new Error("缺少 id。");

    const sb = supabaseService();
    const { error } = await sb
        .from("ai_faq")
        .update({ enabled: nextEnabled })
        .eq("id", id);

    if (error) throw new Error(error.message);

    bustAllFaqCaches();
}

export async function deleteFaq(formData: FormData) {
    const id = String(formData.get("id") ?? "").trim();
    if (!id) throw new Error("缺少 id。");

    const sb = supabaseService();
    const { error } = await sb.from("ai_faq").delete().eq("id", id);
    if (error) throw new Error(error.message);

    bustAllFaqCaches();
}

/**
 * Manual "take off homepage now" without touching the rest of the FAQ row.
 * Used by the 立即下架 button on the admin list.
 */
export async function unpublishNews(formData: FormData) {
    const id = String(formData.get("id") ?? "").trim();
    if (!id) throw new Error("缺少 id。");

    const sb = supabaseService();
    const { error } = await sb
        .from("ai_faq")
        .update({
            news_published_at: null,
            news_expires_at:   null,
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    bustAllFaqCaches();
}
