"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseService } from "@/lib/supabase/server";

/**
 * Bust both the admin list page cache and the AI knowledge-base cache so the
 * chatbot picks up the change on the very next message.
 */
function bustAllFaqCaches() {
    revalidatePath("/admin/ai-faq");
    // Next.js 16 requires a second options argument; empty object = defaults.
    revalidateTag("ai_faq_knowledge", {});
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

    if (!question) throw new Error("「問題」不能空白。");
    if (!answer)   throw new Error("「答案」不能空白。");

    const sb = supabaseService();
    const { error } = await sb
        .from("ai_faq")
        .insert({ category, question, answer, sort_order, notes, enabled: true });

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
    const { error } = await sb
        .from("ai_faq")
        .update({ category, question, answer, sort_order, notes, enabled })
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
