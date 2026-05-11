"use server";

import { supabaseService } from "@/lib/supabase/server";
import { sendLineText } from "@/lib/line";
import { getSignedUpCount } from "@/lib/registration-status";

export type RegistrationActionResult =
    | { ok: true }
    | { ok: false; error: string };

export type RegistrationInput = {
    tourId: string;
    tourTitle: string;

    lastNameZh: string;
    firstNameZh: string;
    lastNameEn: string;
    firstNameEn: string;
    gender: string;
    birthday: string;          // YYYY-MM-DD or ""
    nationalId: string;
    passportNo: string;
    passportExpiry: string;    // YYYY-MM-DD or ""
    phone: string;
    email: string;
    address: string;

    partySize: number;
    roomPreference: string;
    dietary: string;
    specialRequests: string;

    emergencyName: string;
    emergencyRelation: string;
    emergencyPhone: string;

    agreedPrivacy: boolean;
    agreedTerms: boolean;
    agreedMarketing: boolean;

    /** Honeypot — must be empty for real users. */
    honeypot?: string;
};

export async function submitRegistration(
    input: RegistrationInput,
): Promise<RegistrationActionResult> {
    // ── Honeypot check (silent block) ─────────────────────────────
    if (input.honeypot && input.honeypot.trim() !== "") {
        return { ok: true };
    }

    // ── Server-side validation ────────────────────────────────────
    const lastZh  = input.lastNameZh.trim();
    const firstZh = input.firstNameZh.trim();
    const lastEn  = input.lastNameEn.trim();
    const firstEn = input.firstNameEn.trim();
    const passportNo = input.passportNo.trim();
    const phone = input.phone.trim();
    const email = input.email.trim();

    if (!lastZh || !firstZh) return { ok: false, error: "請填寫中文姓名。" };
    if (!lastEn || !firstEn) return { ok: false, error: "請填寫英文姓名。" };
    if (!passportNo) return { ok: false, error: "請填寫護照號碼。" };
    if (!phone) return { ok: false, error: "請填寫手機號碼。" };
    if (!email) return { ok: false, error: "請填寫 Email。" };
    if (input.partySize < 1) return { ok: false, error: "報名人數至少 1 位。" };
    if (!input.agreedPrivacy) return { ok: false, error: "請勾選並同意隱私權政策。" };
    if (!input.agreedTerms) return { ok: false, error: "請勾選並同意旅遊定型化契約。" };

    const sb = supabaseService();

    // ── Capacity re-check (race condition safety) ─────────────────
    const { data: tour, error: tourErr } = await sb
        .from("tours")
        .select("id, max_attendees, status")
        .eq("id", input.tourId)
        .maybeSingle();

    if (tourErr || !tour) {
        return { ok: false, error: "找不到此行程，可能已下架。" };
    }
    if (tour.status !== "published") {
        return { ok: false, error: "此行程目前未開放報名。" };
    }
    if (tour.max_attendees !== null && tour.max_attendees !== undefined) {
        const taken = await getSignedUpCount(tour.id);
        const seatsLeft = tour.max_attendees - taken;
        if (input.partySize > seatsLeft) {
            return {
                ok: false,
                error:
                    seatsLeft <= 0
                        ? "很抱歉，此團剛剛已額滿。"
                        : `本團剩餘 ${seatsLeft} 位，請調整報名人數。`,
            };
        }
    }

    // ── Insert ────────────────────────────────────────────────────
    const { data, error } = await sb
        .from("registrations")
        .insert({
            tour_id:      input.tourId,
            tour_title:   input.tourTitle,

            last_name_zh:  lastZh,
            first_name_zh: firstZh,
            last_name_en:  lastEn,
            first_name_en: firstEn,
            gender:        input.gender || null,
            birthday:      input.birthday || null,
            national_id:   input.nationalId.trim() || null,
            passport_no:   passportNo,
            passport_expiry: input.passportExpiry || null,
            phone,
            email,
            address:       input.address.trim() || null,

            party_size:       input.partySize,
            room_preference:  input.roomPreference || null,
            dietary:          input.dietary.trim() || null,
            special_requests: input.specialRequests.trim() || null,

            emergency_name:     input.emergencyName.trim() || null,
            emergency_relation: input.emergencyRelation.trim() || null,
            emergency_phone:    input.emergencyPhone.trim() || null,

            agreed_privacy:   input.agreedPrivacy,
            agreed_terms:     input.agreedTerms,
            agreed_marketing: input.agreedMarketing,
        })
        .select("id, created_at")
        .single();

    if (error) {
        return { ok: false, error: `儲存失敗：${error.message}` };
    }

    // ── LINE notification (best-effort; don't fail the user flow) ─
    const text = formatLineMessage({
        tourTitle:  input.tourTitle,
        lastZh, firstZh, lastEn, firstEn,
        phone, email,
        partySize: input.partySize,
        room: input.roomPreference,
        passportNo,
        createdAt: data.created_at,
    });
    const lineResult = await sendLineText(text);
    if (!lineResult.ok) {
        console.error("[registration] LINE push failed:", lineResult.reason);
    }

    return { ok: true };
}

function formatLineMessage(p: {
    tourTitle: string;
    lastZh: string; firstZh: string;
    lastEn: string; firstEn: string;
    phone: string; email: string;
    partySize: number;
    room: string;
    passportNo: string;
    createdAt: string;
}): string {
    const roomLabel =
        p.room === "single" ? "單人房"
        : p.room === "double" ? "雙人房"
        : p.room === "triple" ? "三人房"
        : "";

    const lines = [
        "🎒 新團體報名",
        "────────────",
        `行程：${p.tourTitle}`,
        `代表人：${p.lastZh}${p.firstZh}（${p.lastEn} ${p.firstEn}）`,
        `護照：${p.passportNo}`,
        `電話：${p.phone}`,
        `Email：${p.email}`,
        `報名人數：${p.partySize} 位${roomLabel ? `・${roomLabel}` : ""}`,
        "────────────",
        `送出時間：${new Date(p.createdAt).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
        })}`,
    ];
    return lines.filter(Boolean).join("\n");
}
