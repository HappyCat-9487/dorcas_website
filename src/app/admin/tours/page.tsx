import Link from "next/link";
import { supabaseService } from "@/lib/supabase/server";
import { createTour } from "./actions";

export default async function AdminToursPage() {
    const sb = supabaseService();
    const { data: tours } = await sb
        .from("tours")
        .select("id, title, slug, status, updated_at")
        .order("updated_at", { ascending: false });

    return (
        <main className="min-h-screen bg-[#fdf7ee] p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between rounded-xl bg-[#f5ca91]/40 px-5 py-3 border border-[#e8c9a0]">
                <h1 className="text-xl font-bold text-[#7a4020]">🗺️ 行程管理</h1>
                <span className="text-sm text-[#7a4020]/50">
                    共 {tours?.length ?? 0} 個行程
                </span>
            </div>

            {/* Create new tour */}
            <div className="rounded-xl border border-[#e8c9a0] bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-[#b83553]">新增行程</h2>
                <form action={createTour} className="flex gap-2">
                    <input
                        name="title"
                        placeholder="輸入行程名稱..."
                        className="flex-1 rounded-lg border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-2 text-sm focus:border-[#e8928a] focus:outline-none"
                    />
                    <button className="rounded-lg bg-[#e8928a] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                        建立草稿
                    </button>
                </form>
            </div>

            {/* Tour list */}
            <div className="rounded-xl border border-[#e8c9a0] bg-white overflow-hidden">
                {tours && tours.length > 0 ? (
                    <ul className="divide-y divide-[#f0e0c8]">
                        {tours.map((t) => (
                            <li
                                key={t.id}
                                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#fdf7ee]"
                            >
                                <div className="space-y-0.5">
                                    <div className="font-medium text-[#7a4020]">{t.title}</div>
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
                                        <span>/tours/{t.slug}</span>
                                    </div>
                                </div>
                                <Link
                                    href={`/admin/tours/${t.id}`}
                                    className="rounded-lg border border-[#e8c9a0] px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                                >
                                    編輯
                                </Link>
                            </li>
                        ))}
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
