import Link from "next/link";
import { supabaseService } from "@/lib/supabase/server";
import { todayISODateInTimeZone, TOUR_DATE_TZ } from "@/lib/tour-dates";
import {
    publishTourWithSave,
    unpublishTour,
    updateTour,
    setFeaturedOnHome,
} from "../actions";
import { AdminTourInfoForm } from "@/components/admin/admin-tour-info-form";
import { CoverImageUploader } from "@/components/admin/cover-image-uploader";
import { StopsEditor } from "@/components/admin/stops-editor";
import { signOut } from "../../login/actions";
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
            .select("id, title, summary, price_from, airline, visa, start_date, end_date, status, slug, featured_on_home, updated_at")
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

    async function onToggleFeaturedOnHome() {
        "use server";
        await setFeaturedOnHome(id, !tour.featured_on_home);
    }

    const isPublished       = tour.status === "published";
    const isFeaturedOnHome  = Boolean(tour.featured_on_home);
    const minDate = todayISODateInTimeZone(TOUR_DATE_TZ);

    return (
        <main className="min-h-screen bg-[#fdf7ee] p-6 space-y-5">

            {/* ── Header bar ───────────────────────────────────────────── */}
            <div className="flex items-center justify-between rounded-xl bg-[#f5ca91]/40 px-5 py-3 border border-[#e8c9a0]">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/tours"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        ← 返回
                    </Link>
                    <h1 className="text-xl font-bold text-[#7a4020]">✏️ Edit Tour</h1>
                </div>
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

            {/* ── Two-column grid ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_390px]">

                {/* ── Left: text fields ──────────────────────────────── */}
                <AdminTourInfoForm
                    minDate={minDate}
                    tour={{
                        title: tour.title,
                        summary: tour.summary,
                        price_from: tour.price_from,
                        start_date: tour.start_date,
                        end_date: tour.end_date,
                        airline: tour.airline ?? null,
                        visa: tour.visa ?? null,
                        updated_at: tour.updated_at,
                    }}
                    categories={categories}
                    savedParentId={savedParent?.id ?? ""}
                    savedChildId={savedChild?.id ?? ""}
                    isPublished={isPublished}
                    isFeaturedOnHome={isFeaturedOnHome}
                    saveAction={onSave}
                    publishAction={onPublish}
                    unpublishAction={onUnpublish}
                    toggleFeaturedOnHomeAction={onToggleFeaturedOnHome}
                />

                {/* ── Right: images ──────────────────────────────────── */}
                <aside className="space-y-5">
                    {/* Cover image card */}
                    <div className="rounded-xl border border-[#e8c9a0] bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                            封面圖片
                        </h2>
                        <CoverImageUploader
                            key={coverPath ?? "no-cover"}
                            tourId={id}
                            currentPath={coverPath}
                        />
                    </div>

                    {/* Stops editor card */}
                    <div className="rounded-xl border border-[#e8c9a0] bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                            行程景點
                        </h2>
                        <StopsEditor
                            key={stops.map((s) => s.id).join("-")}
                            tourId={id}
                            initialStops={stops}
                        />
                    </div>
                </aside>
            </div>
        </main>
    );
}
