import Link from "next/link";
import { supabaseService } from "@/lib/supabase/server";
import { signOut } from "../login/actions";
import { RegistrationRowActions } from "./registration-row-actions";

// Always read fresh — the admin needs to see new submissions instantly.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RegStatus = "pending" | "confirmed" | "cancelled";

type Registration = {
    id: string;
    tour_id: string | null;
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
    status: RegStatus;
    created_at: string;
};

type SearchParams = {
    status?: string;
    tour?: string;
};

const STATUS_LABEL: Record<RegStatus, string> = {
    pending:   "待確認",
    confirmed: "已確認",
    cancelled: "已取消",
};

const STATUS_PILL: Record<RegStatus, string> = {
    pending:   "bg-[#e8c9a0]/60 text-[#7a4020]",
    confirmed: "bg-[#5bbfa8]/20 text-[#2a8b75]",
    cancelled: "bg-[#fbe9e9] text-[#b04545] line-through",
};

function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

function fmtDateOnly(iso: string | null): string {
    if (!iso) return "—";
    return iso.slice(0, 10);
}

function fmtRoom(value: string | null): string {
    if (value === "single") return "單人房";
    if (value === "double") return "雙人房";
    if (value === "triple") return "三人房";
    return "—";
}

function fmtGender(value: string | null): string {
    if (value === "male")   return "男";
    if (value === "female") return "女";
    if (value === "other")  return "其他";
    return "—";
}

export default async function AdminRegistrationsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const sb = supabaseService();

    let query = sb
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

    const filterStatus = (params.status ?? "all") as RegStatus | "all";
    if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
    }
    if (params.tour) {
        query = query.eq("tour_id", params.tour);
    }

    const { data, error } = await query;
    const rows = ((data as Registration[] | null) ?? []);

    // Pull the list of tours that have at least one registration so the
    // filter dropdown only shows useful options.
    const { data: toursWithRegs } = await sb
        .from("registrations")
        .select("tour_id, tour_title")
        .order("tour_title");
    const seenTours = new Set<string>();
    const tourOptions = ((toursWithRegs ?? []) as { tour_id: string | null; tour_title: string | null }[])
        .filter((r): r is { tour_id: string; tour_title: string | null } => Boolean(r.tour_id))
        .filter((r) => {
            if (seenTours.has(r.tour_id)) return false;
            seenTours.add(r.tour_id);
            return true;
        });

    const exportQs = new URLSearchParams();
    if (filterStatus !== "all") exportQs.set("status", filterStatus);
    if (params.tour) exportQs.set("tour", params.tour);

    return (
        <main className="min-h-screen bg-[#fdf7ee] p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between rounded-xl border border-[#e8c9a0] bg-[#f5ca91]/40 px-5 py-3">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/tours"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        ← 行程管理
                    </Link>
                    <h1 className="text-xl font-bold text-[#7a4020]">📋 報名管理</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[#7a4020]/60">
                        共 {rows.length} 筆
                    </span>
                    <a
                        href={`/admin/registrations/export?${exportQs.toString()}`}
                        className="rounded-lg bg-[#7a4020] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        ⬇ 匯出 CSV
                    </a>
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                        >
                            登出
                        </button>
                    </form>
                </div>
            </div>

            {/* Filter bar (works without JS — server-rendered links) */}
            <form
                method="GET"
                className="flex flex-wrap items-end gap-3 rounded-xl border border-[#e8c9a0] bg-white p-4"
            >
                <div className="space-y-1">
                    <label className="block text-xs text-[#7a4020]/60">狀態</label>
                    <select
                        name="status"
                        defaultValue={filterStatus}
                        className="rounded-lg border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-1.5 text-sm text-[#7a4020] focus:border-[#e8928a] focus:outline-none"
                    >
                        <option value="all">全部</option>
                        <option value="pending">待確認</option>
                        <option value="confirmed">已確認</option>
                        <option value="cancelled">已取消</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="block text-xs text-[#7a4020]/60">行程</label>
                    <select
                        name="tour"
                        defaultValue={params.tour ?? ""}
                        className="rounded-lg border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-1.5 text-sm text-[#7a4020] focus:border-[#e8928a] focus:outline-none"
                    >
                        <option value="">全部行程</option>
                        {tourOptions.map((t) => (
                            <option key={t.tour_id} value={t.tour_id}>
                                {t.tour_title ?? "(無標題)"}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="rounded-lg bg-[#e8928a] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                    套用篩選
                </button>
                <Link
                    href="/admin/registrations"
                    className="rounded-lg border border-[#e8c9a0] px-4 py-1.5 text-sm font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                >
                    清除
                </Link>
            </form>

            {/* List */}
            {error ? (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                    讀取失敗：{error.message}
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded-xl border border-[#e8c9a0] bg-white p-12 text-center text-sm text-[#7a4020]/50">
                    目前沒有符合條件的報名紀錄。
                </div>
            ) : (
                <div className="space-y-3">
                    {rows.map((r) => (
                        <article
                            key={r.id}
                            className={`rounded-xl border p-5 shadow-sm transition-colors ${
                                r.status === "cancelled"
                                    ? "border-[#e07070]/30 bg-[#fbe9e9]/40"
                                    : r.status === "confirmed"
                                    ? "border-[#5bbfa8]/30 bg-[#e6f7f1]/40"
                                    : "border-[#e8c9a0] bg-white"
                            }`}
                        >
                            {/* Top row: title + status + actions */}
                            <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_PILL[r.status]}`}
                                        >
                                            {STATUS_LABEL[r.status]}
                                        </span>
                                        <span className="text-sm font-semibold text-[#7a4020]">
                                            {r.tour_title ?? "(已刪除的行程)"}
                                        </span>
                                    </div>
                                    <div className="text-xs text-[#7a4020]/50">
                                        送出時間：{fmtDate(r.created_at)}
                                    </div>
                                </div>
                                <RegistrationRowActions id={r.id} status={r.status} />
                            </header>

                            {/* Two-column grid of details */}
                            <div className="grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
                                <Detail label="代表人">
                                    {r.last_name_zh}{r.first_name_zh}（{r.last_name_en} {r.first_name_en}）
                                </Detail>
                                <Detail label="報名人數">
                                    <span className="font-semibold text-[#7a4020]">
                                        {r.party_size} 位
                                    </span>
                                    {r.room_preference && <span className="ml-2 text-[#7a4020]/60">{fmtRoom(r.room_preference)}</span>}
                                </Detail>

                                <Detail label="性別／生日">
                                    {fmtGender(r.gender)} ・ {fmtDateOnly(r.birthday)}
                                </Detail>
                                <Detail label="身分證">{r.national_id ?? "—"}</Detail>

                                <Detail label="護照">
                                    {r.passport_no}
                                    {r.passport_expiry && (
                                        <span className="ml-2 text-[#7a4020]/60">
                                            （效期 {fmtDateOnly(r.passport_expiry)}）
                                        </span>
                                    )}
                                </Detail>
                                <Detail label="聯絡">
                                    📞 {r.phone}
                                    <span className="ml-2 text-[#7a4020]/60">✉️ {r.email}</span>
                                </Detail>

                                <Detail label="地址" full>{r.address ?? "—"}</Detail>

                                {r.dietary && <Detail label="飲食／過敏" full>{r.dietary}</Detail>}
                                {r.special_requests && (
                                    <Detail label="特殊需求" full>{r.special_requests}</Detail>
                                )}

                                {(r.emergency_name || r.emergency_phone) && (
                                    <Detail label="緊急聯絡人" full>
                                        {r.emergency_name ?? "—"}
                                        {r.emergency_relation && ` (${r.emergency_relation})`}
                                        {r.emergency_phone && ` ・ ${r.emergency_phone}`}
                                    </Detail>
                                )}

                                <Detail label="行銷訊息">
                                    {r.agreed_marketing ? "✅ 同意" : "—"}
                                </Detail>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

function Detail({
    label,
    children,
    full = false,
}: {
    label: string;
    children: React.ReactNode;
    full?: boolean;
}) {
    return (
        <div className={full ? "md:col-span-2" : undefined}>
            <span className="text-xs text-[#7a4020]/50">{label}：</span>
            <span className="ml-1 text-[#5a3e28]">{children}</span>
        </div>
    );
}
