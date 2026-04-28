"use server";

import { supabaseService } from "@/lib/supabase/server";
import { sendLineText } from "@/lib/line";

export type InquiryActionResult =
    | { ok: true }
    | { ok: false; error: string };

export type InquiryInput = {
    tourId: string | null;
    tourTitle: string | null;
    name: string;
    phone: string;
    email: string;
    message: string;
    agreedPrivacy: boolean;
    /** Honeypot field – must always be empty. Bots tend to fill every input. */
    honeypot?: string;
};

export async function submitInquiry(
    input: InquiryInput,
): Promise<InquiryActionResult> {
    // ── Honeypot check ────────────────────────────────────────────
    // If the hidden field has any content, this is almost certainly a bot.
    // Return a generic success so bots don't know they were blocked.
    if (input.honeypot && input.honeypot.trim() !== "") {
        return { ok: true };
    }

    // ── Server-side validation ────────────────────────────────────
    // (The form also validates on the client; this is the safety net.)
    const name    = input.name.trim();
    const phone   = input.phone.trim();
    const email   = input.email.trim();
    const message = input.message.trim();

    if (!name) return { ok: false, error: "請填寫姓名。" };
    if (!input.agreedPrivacy) {
        return { ok: false, error: "請閱讀並同意隱私權政策。" };
    }
    if (!phone && !email) {
        return { ok: false, error: "請至少留下手機號碼或 Email。" };
    }

    // ── Save to Supabase (service role bypasses RLS for INSERT) ───
    const sb = supabaseService();
    const { data, error } = await sb
        .from("inquiries")
        .insert({
            tour_id:       input.tourId,
            tour_title:    input.tourTitle,
            name,
            phone:   phone   || null,
            email:   email   || null,
            message: message || null,
            agreed_privacy: input.agreedPrivacy,
        })
        .select("id, created_at")
        .single();

    if (error) {
        return { ok: false, error: `儲存失敗：${error.message}` };
    }

    // ── Send LINE notification ────────────────────────────────────
    // Note: we don't fail the whole submission if LINE is down — the
    // inquiry is already safely stored in the DB. Just log the reason.
    const lineText = formatLineMessage({
        ...input,
        name,
        phone,
        email,
        message,
        createdAt: data.created_at,
    });
    const lineResult = await sendLineText(lineText);
    if (!lineResult.ok) {
        console.error("[inquiry] LINE push failed:", lineResult.reason);
    }

    return { ok: true };
}

function formatLineMessage(
    i: InquiryInput & { createdAt: string },
): string {
    const lines = [
        "📩 新行程諮詢",
        "────────────",
        i.tourTitle ? `行程：${i.tourTitle}` : null,
        `姓名：${i.name}`,
        i.phone ? `電話：${i.phone}` : null,
        i.email ? `Email：${i.email}` : null,
        i.message ? `\n需求：\n${i.message}` : null,
        "────────────",
        `送出時間：${new Date(i.createdAt).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
        })}`,
    ];
    return lines.filter(Boolean).join("\n");
}
