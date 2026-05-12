import Link from "next/link";
import { supabaseService } from "@/lib/supabase/server";
import { createTour } from "./actions";
import { signOut } from "../login/actions";
import { CreateTourForm } from "./create-tour-form";
import { DeleteTourButton } from "./delete-tour-button";
import { todayISODateInTimeZone, TOUR_DATE_TZ } from "@/lib/tour-dates";

type TourListRow = {
    id: string;
    title: string;
    slug: string;
    status: string;
    start_date: string | null;
    updated_at: string;
};

export default async function AdminToursPage() {
    const sb = supabaseService();
    const { data } = await sb
        .from("tours")
        .select("id, title, slug, status, start_date, updated_at")
        .order("updated_at", { ascending: false });

    const allTours = (data ?? []) as TourListRow[];
    const today = todayISODateInTimeZone(TOUR_DATE_TZ);

    // Split into upcoming (incl. tours with no start_date yet) and expired,
    // expired ones are pushed to the bottom and visually dimmed.
    const upcoming = allTours.filter(
        (t) => !t.start_date || t.start_date >= today,
    );
    const expired = allTours.filter(
        (t) => t.start_date && t.start_date < today,
    );
    // Expired list: sort by start_date desc (most recently expired first).
    expired.sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? ""));

    const tours = [...upcoming, ...expired];

    return (
        <main className="min-h-screen bg-[#fdf7ee] p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between rounded-xl bg-[#f5ca91]/40 px-5 py-3 border border-[#e8c9a0]">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-[#7a4020]">🗺️ 行程管理</h1>
                    <Link
                        href="/admin/destinations"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        🏞️ 地區頁面
                    </Link>
                    <Link
                        href="/admin/registrations"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        📋 報名管理
                    </Link>
                    <Link
                        href="/admin/ai-faq"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        🤖 AI 知識庫
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        ⚙️ 網站設定
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[#7a4020]/50">
                        共 {tours?.length ?? 0} 個行程
                    </span>
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

            {/* Create new tour */}
            <div className="rounded-xl border border-[#e8c9a0] bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-[#b83553]">新增行程</h2>
                <CreateTourForm action={createTour} />
            </div>

            {/* Tour list */}
            <div className="rounded-xl border border-[#e8c9a0] bg-white overflow-hidden">
                {tours.length > 0 ? (
                    <ul className="divide-y divide-[#f0e0c8]">
                        {tours.map((t) => {
                            const isExpired =
                                !!t.start_date && t.start_date < today;
                            return (
                                <li
                                    key={t.id}
                                    className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#fdf7ee] ${
                                        isExpired ? "bg-[#f0e0c8]/30 opacity-60" : ""
                                    }`}
                                >
                                    <div className="space-y-0.5">
                                        <div
                                            className={`font-medium ${
                                                isExpired
                                                    ? "text-[#7a4020]/50 line-through"
                                                    : "text-[#7a4020]"
                                            }`}
                                        >
                                            {t.title}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[#7a4020]/50">
                                            <span
                                                className={`rounded-full px-2 py-0.5 font-medium ${
                                                    t.status === "published"
                                                        ? "bg-[#e8928a]/15 text-[#e8928a]"
                                                        : "bg-[#e8c9a0]/50 text-[#7a4020]/60"
                                                }`}
                                            >
                                                {t.status === "published" ? "已發佈" : "草稿"}
                                            </span>
                                            {isExpired && (
                                                <span className="rounded-full bg-[#7a4020]/15 px-2 py-0.5 font-medium text-[#7a4020]/60">
                                                    已過期
                                                </span>
                                            )}
                                            <span>/tours/{t.slug}</span>
                                            {t.start_date && (
                                                <span className="text-[#7a4020]/40">
                                                    出發 {t.start_date}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/tours/${t.id}`}
                                            className="rounded-lg border border-[#e8c9a0] px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                                        >
                                            編輯
                                        </Link>
                                        <DeleteTourButton
                                            tourId={t.id}
                                            tourTitle={t.title}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="px-5 py-8 text-center text-sm text-[#7a4020]/40">
                        還沒有任何行程，從上方新增第一個吧。
                    </p>
                )}
            </div>
        </main>
    );
}
