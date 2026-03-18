import { supabaseService } from "@/lib/supabase/server";
import { publishTourWithSave, unpublishTour, updateTour } from "../actions";
import { CategorySelector } from "@/components/admin/category-selector";
import type { Category } from "@/components/admin/category-selector";

export default async function AdminTourEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const sb = supabaseService();

    // ── Fetch tour, all categories, and current tour_categories in parallel
    const [tourRes, categoriesRes, tourCatsRes] = await Promise.all([
        sb
            .from("tours")
            .select("id, title, summary, content, status, slug")
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
    ]);

    if (tourRes.error || !tourRes.data)
        return <div className="p-6">Tour not found.</div>;

    const tour       = tourRes.data;
    const categories = (categoriesRes.data ?? []) as Category[];
    const savedIds   = new Set((tourCatsRes.data ?? []).map((r) => r.category_id));

    // Derive pre-selected parent / child from saved categories
    const parents   = categories.filter((c) => c.parent_id === null);
    const savedParent = parents.find((p) => savedIds.has(p.id));
    const savedChild  = categories.find(
        (c) => c.parent_id !== null && savedIds.has(c.id),
    );

    // ── Server actions (close over `id`)
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

    return (
        <main className="p-6 space-y-6 max-w-2xl">
            <h1 className="text-2xl font-semibold">Edit Tour</h1>
            <div className="text-sm opacity-70">
                Status: <strong>{tour.status}</strong> · /tours/{tour.slug}
            </div>

            {/*
              Single form — both Save and Save & Publish submit all fields.
              Each button has its own formAction (React 19 / Next 15).
            */}
            <form className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">Title</label>
                    <input
                        name="title"
                        defaultValue={tour.title}
                        required
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>

                {/* Summary */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">Summary</label>
                    <input
                        name="summary"
                        defaultValue={tour.summary ?? ""}
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>

                {/* Content */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">Content (Markdown)</label>
                    <textarea
                        name="content"
                        defaultValue={tour.content ?? ""}
                        rows={10}
                        className="border rounded px-3 py-2 w-full font-mono text-sm"
                    />
                </div>

                {/* Category selector — cascading parent → child */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">Category</label>
                    <CategorySelector
                        categories={categories}
                        initialParentId={savedParent?.id ?? ""}
                        initialChildId={savedChild?.id ?? ""}
                    />
                </div>

                {/* Action buttons — same form, different server actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        formAction={onSave}
                        className="border rounded px-4 py-2 hover:bg-gray-50"
                    >
                        Save
                    </button>

                    {tour.status !== "published" && (
                        <button
                            formAction={onPublish}
                            className="border rounded px-4 py-2 bg-green-50 hover:bg-green-100"
                        >
                            Save &amp; Publish
                        </button>
                    )}
                </div>
            </form>

            {/* Unpublish — separate form, no content needed */}
            {tour.status === "published" && (
                <form action={onUnpublish}>
                    <button className="border rounded px-4 py-2 bg-red-50 hover:bg-red-100">
                        Unpublish
                    </button>
                </form>
            )}
        </main>
    );
}
