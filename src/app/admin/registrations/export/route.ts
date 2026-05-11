import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

// CSV columns shown to admin / forwarded to airline / hotel.
// Add or remove rows here to change the export.
const COLUMNS: { key: string; header: string; map: (r: Reg) => string }[] = [
    { key: "created_at",       header: "送出時間",     map: (r) => fmtDate(r.created_at) },
    { key: "status",           header: "狀態",         map: (r) => statusLabel(r.status) },
    { key: "tour_title",       header: "行程",         map: (r) => r.tour_title ?? "" },
    { key: "last_name_zh",     header: "中文姓",       map: (r) => r.last_name_zh },
    { key: "first_name_zh",    header: "中文名",       map: (r) => r.first_name_zh },
    { key: "last_name_en",     header: "英文姓",       map: (r) => r.last_name_en },
    { key: "first_name_en",    header: "英文名",       map: (r) => r.first_name_en },
    { key: "gender",           header: "性別",         map: (r) => genderLabel(r.gender) },
    { key: "birthday",         header: "生日",         map: (r) => r.birthday ?? "" },
    { key: "national_id",      header: "身分證字號",   map: (r) => r.national_id ?? "" },
    { key: "passport_no",      header: "護照號碼",     map: (r) => r.passport_no },
    { key: "passport_expiry",  header: "護照效期",     map: (r) => r.passport_expiry ?? "" },
    { key: "phone",            header: "手機",         map: (r) => r.phone },
    { key: "email",            header: "Email",       map: (r) => r.email },
    { key: "address",          header: "地址",         map: (r) => r.address ?? "" },
    { key: "party_size",       header: "報名人數",     map: (r) => String(r.party_size) },
    { key: "room_preference",  header: "房型",         map: (r) => roomLabel(r.room_preference) },
    { key: "dietary",          header: "飲食/過敏",    map: (r) => r.dietary ?? "" },
    { key: "special_requests", header: "特殊需求",     map: (r) => r.special_requests ?? "" },
    { key: "emergency_name",   header: "緊急聯絡人",   map: (r) => r.emergency_name ?? "" },
    { key: "emergency_relation", header: "關係",       map: (r) => r.emergency_relation ?? "" },
    { key: "emergency_phone",  header: "緊急聯絡電話", map: (r) => r.emergency_phone ?? "" },
    { key: "agreed_marketing", header: "同意行銷",     map: (r) => (r.agreed_marketing ? "Y" : "N") },
];

type Reg = {
    id: string;
    tour_title: string | null;
    last_name_zh: string;
    first_name_zh: string;
    last_name_en: string;
    first_name_en: string;
    gender: string | null;
    birthday: string | null;
    national_id: string | null;
    passport_no: string;
    passport_expiry: string | null;
    phone: string;
    email: string;
    address: string | null;
    party_size: number;
    room_preference: string | null;
    dietary: string | null;
    special_requests: string | null;
    emergency_name: string | null;
    emergency_relation: string | null;
    emergency_phone: string | null;
    agreed_marketing: boolean;
    status: "pending" | "confirmed" | "cancelled";
    created_at: string;
};

function statusLabel(s: Reg["status"]): string {
    if (s === "pending")   return "待確認";
    if (s === "confirmed") return "已確認";
    return "已取消";
}
function genderLabel(g: string | null): string {
    if (g === "male")   return "男";
    if (g === "female") return "女";
    if (g === "other")  return "其他";
    return "";
}
function roomLabel(r: string | null): string {
    if (r === "single") return "單人房";
    if (r === "double") return "雙人房";
    if (r === "triple") return "三人房";
    return "";
}
function fmtDate(iso: string): string {
    return new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

/**
 * Quote a CSV cell. Always wrap in double quotes; double up internal quotes.
 * This is the safest universal escaping (handles commas, newlines, CJK).
 */
function csvCell(v: string): string {
    return `"${v.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const tourId = searchParams.get("tour");

    const sb = supabaseService();
    let q = sb
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

    if (status && ["pending", "confirmed", "cancelled"].includes(status)) {
        q = q.eq("status", status);
    }
    if (tourId) {
        q = q.eq("tour_id", tourId);
    }

    const { data, error } = await q;
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const rows = (data ?? []) as Reg[];

    const header = COLUMNS.map((c) => csvCell(c.header)).join(",");
    const body = rows
        .map((r) => COLUMNS.map((c) => csvCell(c.map(r))).join(","))
        .join("\n");

    // UTF-8 BOM so Excel opens Chinese characters correctly without garbled
    // text. Without this, Excel on Windows often shows mojibake for 中文.
    const csv = "\uFEFF" + header + "\n" + body;

    const filename = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
        },
    });
}
