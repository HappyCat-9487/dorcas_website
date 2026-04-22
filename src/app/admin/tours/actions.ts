"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseService } from "@/lib/supabase/server";
import { assertValidTourDateRange } from "@/lib/tour-dates";

function slugify(text: string) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

/**
 * Pick a slug that won't collide with any other tour.
 * If `base` is already in use by a different tour, tack on `-2`, `-3`, …
 * until we find a free one. Pass `excludeTourId` when editing so the tour's
 * own existing slug doesn't count as "taken".
 */
async function ensureUniqueSlug(
    sb: ReturnType<typeof supabaseService>,
    base: string,
    excludeTourId?: string,
): Promise<string> {
    if (!base) throw new Error("Title cannot be empty (slug would be empty)");

    let candidate = base;
    for (let i = 2; i < 1000; i++) {
        const query = sb.from("tours").select("id").eq("slug", candidate);
        const { data, error } = await query;
        if (error) throw new Error(error.message);

        const taken = (data ?? []).some((row) => row.id !== excludeTourId);
        if (!taken) return candidate;

        candidate = `${base}-${i}`;
    }
    throw new Error("Unable to generate unique slug");
}

export async function createTour(formData: FormData) {
    const title = String(formData.get("title") || "").trim();
    if (!title) throw new Error("Title is required");

    const slug = slugify(title);

    const sb = supabaseService();
    const { data, error } = await sb
        .from("tours")
        .insert({ title, slug, status: "draft" })
        .select("id")
        .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/tours");
    redirect(`/admin/tours/${data.id}`);
}

async function syncCategories(
    sb: ReturnType<typeof supabaseService>,
    tourId: string,
    formData: FormData,
) {
    const parentId = String(formData.get("parent_category_id") || "");
    const childId  = String(formData.get("child_category_id")  || "");

    await sb.from("tour_categories").delete().eq("tour_id", tourId);

    const ids = [parentId, childId].filter(Boolean);
    if (ids.length === 0) return;

    const { error } = await sb.from("tour_categories").insert(
        ids.map((category_id) => ({ tour_id: tourId, category_id })),
    );
    if (error) throw new Error(error.message);
}

export async function updateTour(tourId: string, formData: FormData) {
    const title      = String(formData.get("title")      || "").trim();
    const summary    = String(formData.get("summary")    || "");
    const price_from = String(formData.get("price_from") || "");
    const startRaw = String(formData.get("start_date") || "").trim();
    const endRaw   = String(formData.get("end_date")   || "").trim();
    assertValidTourDateRange(startRaw, endRaw);
    const start_date = startRaw;
    const end_date   = endRaw;

    if (!title) throw new Error("Title is required");

    const sb = supabaseService();
    const slug = await ensureUniqueSlug(sb, slugify(title), tourId);

    const { data: oldRow } = await sb
        .from("tours")
        .select("slug")
        .eq("id", tourId)
        .maybeSingle();

    const { error } = await sb
        .from("tours")
        .update({
            title,
            slug,
            summary,
            price_from,
            start_date,
            end_date,
            updated_at: new Date().toISOString(),
        })
        .eq("id", tourId);

    if (error) throw new Error(error.message);

    await syncCategories(sb, tourId, formData);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath("/admin/tours");
    revalidatePath("/");
    revalidatePath(`/tours/${slug}`);
    if (oldRow?.slug && oldRow.slug !== slug) {
        revalidatePath(`/tours/${oldRow.slug}`);
    }
    redirect(`/admin/tours/${tourId}`);
}

export async function publishTour(tourId: string) {
    const sb = supabaseService();
    const { error } = await sb
        .from("tours")
        .update({
            status: "published",
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", tourId);

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath("/tours");
    revalidatePath("/");
    redirect(`/admin/tours/${tourId}`);
}

export async function publishTourWithSave(tourId: string, formData: FormData) {
    const title      = String(formData.get("title")      || "").trim();
    const summary    = String(formData.get("summary")    || "");
    const price_from = String(formData.get("price_from") || "");
    const startRaw = String(formData.get("start_date") || "").trim();
    const endRaw   = String(formData.get("end_date")   || "").trim();
    assertValidTourDateRange(startRaw, endRaw);
    const start_date = startRaw;
    const end_date   = endRaw;

    if (!title) throw new Error("Title is required");

    const sb = supabaseService();
    const slug = await ensureUniqueSlug(sb, slugify(title), tourId);

    const { data: oldRow } = await sb
        .from("tours")
        .select("slug")
        .eq("id", tourId)
        .maybeSingle();

    const { error } = await sb
        .from("tours")
        .update({
            title,
            slug,
            summary,
            price_from,
            start_date,
            end_date,
            status: "published",
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", tourId);

    if (error) throw new Error(error.message);

    await syncCategories(sb, tourId, formData);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath("/admin/tours");
    revalidatePath("/tours");
    revalidatePath("/");
    revalidatePath(`/tours/${slug}`);
    if (oldRow?.slug && oldRow.slug !== slug) {
        revalidatePath(`/tours/${oldRow.slug}`);
    }
    redirect(`/admin/tours/${tourId}`);
}

export async function setFeaturedOnHome(tourId: string, featured: boolean) {
    const sb = supabaseService();
    const { error } = await sb
        .from("tours")
        .update({
            featured_on_home: featured,
            updated_at: new Date().toISOString(),
        })
        .eq("id", tourId);

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath("/admin/tours");
    revalidatePath("/");
    redirect(`/admin/tours/${tourId}`);
}

export async function unpublishTour(tourId: string) {
    const sb = supabaseService();
    const { error } = await sb
        .from("tours")
        .update({
            status: "draft",
            published_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", tourId);

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath("/tours");
    revalidatePath("/");
    redirect(`/admin/tours/${tourId}`);
}

// ── Cover image ───────────────────────────────────────────────────────────────

export async function upsertCoverImage(tourId: string, path: string, alt: string) {
    const sb = supabaseService();

    // Remove any existing cover image row first
    await sb
        .from("tour_images")
        .delete()
        .eq("tour_id", tourId)
        .eq("is_cover", true);

    const { error } = await sb.from("tour_images").insert({
        tour_id: tourId,
        path,
        alt: alt || null,
        sort_order: 0,
        is_cover: true,
    });

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath(`/tours`);
}

// ── Tour stops ────────────────────────────────────────────────────────────────

export type TourStopData = {
    id?: string;
    sort_order: number;
    subtheme: string;
    introduction: string;
    image_path: string;
    icon_path: string;
};

export async function upsertTourStop(tourId: string, stop: TourStopData) {
    const sb = supabaseService();

    if (stop.id) {
        const { error } = await sb
            .from("tour_stops")
            .update({
                sort_order:   stop.sort_order,
                subtheme:     stop.subtheme,
                introduction: stop.introduction,
                image_path:   stop.image_path || null,
                icon_path:    stop.icon_path  || null,
            })
            .eq("id", stop.id);
        if (error) throw new Error(error.message);
    } else {
        const { error } = await sb.from("tour_stops").insert({
            tour_id:      tourId,
            sort_order:   stop.sort_order,
            subtheme:     stop.subtheme,
            introduction: stop.introduction,
            image_path:   stop.image_path || null,
            icon_path:    stop.icon_path  || null,
        });
        if (error) throw new Error(error.message);
    }

    await sb
        .from("tours")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", tourId);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath(`/tours`);
}

export async function deleteTourStop(stopId: string, tourId: string) {
    const sb = supabaseService();
    const { data, error } = await sb
        .from("tour_stops")
        .delete()
        .eq("id", stopId)
        .select("id");

    if (error) throw new Error(error.message);
    if (!data?.length) {
        throw new Error(
            "刪除失敗：資料庫沒有刪除任何列（可能是權限或 id 不存在）。請確認 SUPABASE_SERVICE_ROLE_KEY 已設定在伺服器環境變數。",
        );
    }

    await sb
        .from("tours")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", tourId);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath(`/tours`);
    redirect(`/admin/tours/${tourId}`);
}
