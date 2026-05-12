import Link from "next/link";
import { supabaseService } from "@/lib/supabase/server";
import { signOut } from "../login/actions";
import {
    createFaq,
    updateFaq,
    toggleFaqEnabled,
} from "./actions";
import { DeleteFaqButton } from "./delete-faq-button";

// FAQ edits should take effect immediately on the next chat — never serve
// a cached list.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type FaqRow = {
    id: string;
    category: string;
    question: string;
    answer: string;
    sort_order: number;
    enabled: boolean;
    notes: string | null;
    updated_at: string;
};

export default async function AdminAiFaqPage({
    searchParams,
}: {
    searchParams: Promise<{ edit?: string }>;
}) {
    const { edit: editingId } = await searchParams;
    const sb = supabaseService();

    const { data: rowsRaw } = await sb
        .from("ai_faq")
        .select(
            "id, category, question, answer, sort_order, enabled, notes, updated_at",
        )
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

    const rows = (rowsRaw ?? []) as FaqRow[];
    const editing = rows.find((r) => r.id === editingId) ?? null;

    // Group by category for nicer rendering.
    const byCategory = rows.reduce<Record<string, FaqRow[]>>((acc, r) => {
        const key = r.category || "一般";
        (acc[key] ||= []).push(r);
        return acc;
    }, {});
    const categoryOrder = Object.keys(byCategory).sort();

    return (
        <main className="min-h-screen bg-[#fdf7ee] p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between rounded-xl bg-[#f5ca91]/40 px-5 py-3 border border-[#e8c9a0]">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/tours"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        ← 返回行程管理
                    </Link>
                    <h1 className="text-xl font-bold text-[#7a4020]">🤖 AI 諮詢知識庫</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[#7a4020]/50">
                        共 {rows.length} 條（已停用 {rows.filter((r) => !r.enabled).length}）
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

            {/* Intro */}
            <div className="rounded-xl border border-[#e8c9a0] bg-white/60 p-4 text-sm text-[#7a4020]/80 leading-relaxed">
                <p>
                    這裡的問答會自動被 AI 諮詢使用。新增、修改、停用後
                    <strong className="text-[#b83553]">下一次客人提問就會生效</strong>，不用重啟伺服器。
                </p>
                <p className="mt-1 text-xs text-[#7a4020]/60">
                    答案欄位支援 markdown（**粗體**、條列、連結等）。
                </p>
            </div>

            {/* Create / Edit form */}
            <div className="rounded-xl border border-[#e8c9a0] bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-[#b83553]">
                    {editing ? `編輯：${editing.question}` : "新增 FAQ"}
                </h2>

                <form
                    action={editing ? updateFaq : createFaq}
                    className="space-y-3"
                    key={editing?.id ?? "new"}  /* reset form state when switching rows */
                >
                    {editing && <input type="hidden" name="id" value={editing.id} />}

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_120px]">
                        <Field label="分類">
                            <input
                                name="category"
                                defaultValue={editing?.category ?? "一般"}
                                placeholder="簽證、護照、入境卡…"
                                className={INPUT_CLS}
                                required
                            />
                        </Field>
                        <Field label="問題（或關鍵字提示）">
                            <input
                                name="question"
                                defaultValue={editing?.question ?? ""}
                                placeholder="日本要簽證嗎？"
                                className={INPUT_CLS}
                                required
                            />
                        </Field>
                        <Field label="排序">
                            <input
                                name="sort_order"
                                type="number"
                                defaultValue={editing?.sort_order ?? 0}
                                className={INPUT_CLS}
                            />
                        </Field>
                    </div>

                    <Field label="答案（給 AI 參考的標準答案，支援 markdown）">
                        <textarea
                            name="answer"
                            defaultValue={editing?.answer ?? ""}
                            rows={5}
                            placeholder="台灣護照前往日本免簽證，可停留 90 天。"
                            className={`${INPUT_CLS} font-mono leading-relaxed`}
                            required
                        />
                    </Field>

                    <Field label="內部備註（不會送給 AI）">
                        <textarea
                            name="notes"
                            defaultValue={editing?.notes ?? ""}
                            rows={2}
                            placeholder="例：2026 年起需 ETIAS，記得每年確認最新公告。"
                            className={INPUT_CLS}
                        />
                    </Field>

                    {editing && (
                        <label className="flex items-center gap-2 text-sm text-[#7a4020]">
                            <input
                                type="checkbox"
                                name="enabled"
                                defaultChecked={editing.enabled}
                            />
                            啟用（取消勾選 = AI 不會看到這條，但資料保留）
                        </label>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                        {editing && (
                            <Link
                                href="/admin/ai-faq"
                                className="rounded-lg border border-[#e8c9a0] px-4 py-1.5 text-xs font-medium text-[#7a4020] hover:bg-[#fdf7ee]"
                            >
                                取消編輯
                            </Link>
                        )}
                        <button
                            type="submit"
                            className="rounded-lg bg-[#e8928a] px-5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        >
                            {editing ? "儲存修改" : "新增 FAQ"}
                        </button>
                    </div>
                </form>
            </div>

            {/* FAQ list grouped by category */}
            <div className="space-y-4">
                {categoryOrder.length === 0 ? (
                    <p className="rounded-xl border border-[#e8c9a0] bg-white px-5 py-8 text-center text-sm text-[#7a4020]/40">
                        還沒有任何 FAQ，從上方新增第一條吧。
                    </p>
                ) : (
                    categoryOrder.map((cat) => (
                        <div
                            key={cat}
                            className="rounded-xl border border-[#e8c9a0] bg-white overflow-hidden"
                        >
                            <div className="border-b border-[#f0e0c8] bg-[#fdf7ee] px-5 py-2 text-sm font-semibold text-[#b83553]">
                                {cat}
                                <span className="ml-2 text-xs font-normal text-[#7a4020]/40">
                                    {byCategory[cat].length} 條
                                </span>
                            </div>
                            <ul className="divide-y divide-[#f0e0c8]">
                                {byCategory[cat].map((row) => (
                                    <FaqRowItem key={row.id} row={row} />
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

const INPUT_CLS =
    "w-full rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-sm focus:border-[#e8928a] focus:outline-none";

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block space-y-1 text-xs font-medium text-[#7a4020]">
            <span>{label}</span>
            {children}
        </label>
    );
}

function FaqRowItem({ row }: { row: FaqRow }) {
    return (
        <li className={`px-5 py-4 ${row.enabled ? "" : "opacity-50"}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#7a4020]">
                            {row.question}
                        </span>
                        {!row.enabled && (
                            <span className="rounded-full bg-[#7a4020]/15 px-2 py-0.5 text-[10px] text-[#7a4020]/60">
                                已停用
                            </span>
                        )}
                    </div>
                    <p className="text-xs leading-relaxed text-[#7a4020]/70 line-clamp-2 whitespace-pre-wrap">
                        {row.answer}
                    </p>
                    {row.notes && (
                        <p className="text-[11px] italic text-[#7a4020]/40 line-clamp-1">
                            備註：{row.notes}
                        </p>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                    <form action={toggleFaqEnabled}>
                        <input type="hidden" name="id"   value={row.id} />
                        <input type="hidden" name="next" value={String(!row.enabled)} />
                        <button
                            type="submit"
                            className="rounded-lg border border-[#e8c9a0] px-2.5 py-1 text-[11px] font-medium text-[#7a4020] hover:bg-[#fdf7ee]"
                            title={row.enabled ? "停用（AI 不會用到）" : "啟用"}
                        >
                            {row.enabled ? "停用" : "啟用"}
                        </button>
                    </form>

                    <Link
                        href={`/admin/ai-faq?edit=${row.id}#top`}
                        className="rounded-lg border border-[#e8c9a0] px-2.5 py-1 text-[11px] font-medium text-[#7a4020] hover:bg-[#fdf7ee]"
                    >
                        編輯
                    </Link>

                    <DeleteFaqButton id={row.id} />
                </div>
            </div>
        </li>
    );
}
