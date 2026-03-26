import { supabaseService } from "@/lib/supabase/server";
import { publishTourWithSave, unpublishTour, updateTour } from "../actions";
import { CategorySelector } from "@/components/admin/category-selector";
import { CoverImageUploader } from "@/components/admin/cover-image-uploader";
import { StopsEditor } from "@/components/admin/stops-editor";
import type { Category } from "@/components/admin/category-selector";

export default async function AdminTourEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const sb = supabaseService();

    const [tourRes, categoriesRes, tourCatsRes, coverRes, stopsRes] = await Promise.all([
        sb
            .from("tours")
            .select("id, title, summary, price_from, start_date, end_date, status, slug")
            .eq("id", id)
            .single(),
        sb
            .from("categories")
            .select("id, name, parent_id")
            .eq("type", "region")
            .order("name"),
        sb
            .from("tour_categories")
            .select("category_id")
            .eq("tour_id", id),
        sb
            .from("tour_images")
            .select("path")
            .eq("tour_id", id)
            .eq("is_cover", true)
            .maybeSingle(),
        sb
            .from("tour_stops")
            .select("id, sort_order, subtheme, introduction, image_path, icon_path")
            .eq("tour_id", id)
            .order("sort_order"),
    ]);

    if (tourRes.error || !tourRes.data)
        return <div className="p-6">Tour not found.</div>;

    const tour       = tourRes.data;
    const categories = (categoriesRes.data ?? []) as Category[];
    const savedIds   = new Set((tourCatsRes.data ?? []).map((r) => r.category_id));
    const coverPath  = coverRes.data?.path ?? null;
    const stops      = stopsRes.data ?? [];

    const parents     = categories.filter((c) => c.parent_id === null);
    const savedParent = parents.find((p) => savedIds.has(p.id));
    const savedChild  = categories.find(
        (c) => c.parent_id !== null && savedIds.has(c.id),
    );

    async function onSave(formData: FormData) {
        "use server";
        await updateTour(id, formData);
    }

    async function onPublish(formData: FormData) {
        "use server";
        await publishTourWithSave(id, formData);
    }

    async function onUnpublish() {
        "use server";
        await unpublishTour(id);
    }

    const isPublished = tour.status === "published";

    return (
        <main className="min-h-screen bg-[#fdf7ee] p-6 space-y-5">

            {/* ── Header bar ───────────────────────────────────────────── */}
            <div className="flex items-center justify-between rounded-xl bg-[#f5ca91]/40 px-5 py-3 border border-[#e8c9a0]">
                <h1 className="text-xl font-bold text-[#7a4020]">✏️ Edit Tour</h1>
                <div className="flex items-center gap-2 text-sm text-[#7a4020]/70">
                    <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isPublished
                                ? "bg-[#e8928a] text-white"
                                : "bg-[#e8c9a0] text-[#7a4020]"
                        }`}
                    >
                        {isPublished ? "已發佈" : "草稿"}
                    </span>
                    <span className="opacity-60">/tours/{tour.slug}</span>
                </div>
            </div>

            {/* ── Two-column grid ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_390px]">

                {/* ── Left: text fields ──────────────────────────────── */}
                <form className="space-y-4 rounded-xl border border-[#e8c9a0] bg-white p-6">
                    <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                        行程資訊
                    </h2>

                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[#7a4020]">Title（行程名稱）</label>
                        <input
                            name="title"
                            defaultValue={tour.title}
                            required
                            className="w-full rounded-lg border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-2 text-sm focus:border-[#e8928a] focus:outline-none"
                        />
                    </div>

                    {/* Summary */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[#7a4020]">Summary（簡介）</label>
                        <input
                            name="summary"
                            defaultValue={tour.summary ?? ""}
                            className="w-full rounded-lg border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-2 text-sm focus:border-[#e8928a] focus:outline-none"
                        />
                    </div>

                    {/* Price — numbers only, stored as raw digits e.g. "179000" */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[#7a4020]">
                            起始價格（台幣，Price from）
                        </label>
                        <div className="flex items-center gap-0 overflow-hidden rounded-lg border border-[#e8c9a0] focus-within:border-[#e8928a]">
                            <span className="shrink-0 border-r border-[#e8c9a0] bg-[#f5ca91]/30 px-3 py-2 text-sm font-medium text-[#7a4020]">
                                NT$
                            </span>
                            <input
                                name="price_from"
                                type="number"
                                min="0"
                                step="1000"
                                defaultValue={tour.price_from ?? ""}
                                placeholder="179000"
                                className="w-full bg-[#fdf7ee] px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>
                        <p className="text-xs text-[#7a4020]/40">只輸入數字，例如 179000</p>
                    </div>

                    {/* Date range — calendar pickers */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[#7a4020]">
                            出發日期範圍
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <span className="text-xs text-[#7a4020]/50">起始日期</span>
                                <input
                                    name="start_date"
                                    type="date"
                                    defaultValue={tour.start_date ?? ""}
                                    className="w-full rounded-lg border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-2 text-sm text-[#7a4020] focus:border-[#e8928a] focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-[#7a4020]/50">結束日期</span>
                                <input
                                    name="end_date"
                                    type="date"
                                    defaultValue={tour.end_date ?? ""}
                                    className="w-full rounded-lg border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-2 text-sm text-[#7a4020] focus:border-[#e8928a] focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[#7a4020]">Category（地區分類）</label>
                        <CategorySelector
                            categories={categories}
                            initialParentId={savedParent?.id ?? ""}
                            initialChildId={savedChild?.id ?? ""}
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 border-t border-[#e8c9a0] pt-4">
                        <button
                            formAction={onSave}
                            className="rounded-lg border border-[#e8c9a0] bg-white px-5 py-2 text-sm font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                        >
                            儲存草稿
                        </button>

                        {!isPublished && (
                            <button
                                formAction={onPublish}
                                className="rounded-lg bg-[#e8928a] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            >
                                儲存並發佈
                            </button>
                        )}

                        {isPublished && (
                            <button
                                formAction={onUnpublish}
                                className="rounded-lg border border-[#e8928a] px-5 py-2 text-sm font-medium text-[#e8928a] transition-colors hover:bg-[#e8928a]/10"
                            >
                                取消發佈
                            </button>
                        )}
                    </div>
                </form>

                {/* ── Right: images ──────────────────────────────────── */}
                <aside className="space-y-5">
                    {/* Cover image card */}
                    <div className="rounded-xl border border-[#e8c9a0] bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                            封面圖片
                        </h2>
                        <CoverImageUploader tourId={id} currentPath={coverPath} />
                    </div>

                    {/* Stops editor card */}
                    <div className="rounded-xl border border-[#e8c9a0] bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                            行程景點
                        </h2>
                        <StopsEditor tourId={id} initialStops={stops} />
                    </div>
                </aside>
            </div>
        </main>
    );
}
