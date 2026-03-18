"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseService } from "@/lib/supabase/server";

function slugify(text: string) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
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

    // wipe existing, then re-insert selected ones
    await sb.from("tour_categories").delete().eq("tour_id", tourId);

    const ids = [parentId, childId].filter(Boolean);
    if (ids.length === 0) return;

    const { error } = await sb.from("tour_categories").insert(
        ids.map((category_id) => ({ tour_id: tourId, category_id })),
    );
    if (error) throw new Error(error.message);
}

export async function updateTour(tourId: string, formData: FormData) {
    const title   = String(formData.get("title")   || "").trim();
    const summary = String(formData.get("summary") || "");
    const content = String(formData.get("content") || "");

    const sb = supabaseService();
    const { error } = await sb
        .from("tours")
        .update({ title, summary, content })
        .eq("id", tourId);

    if (error) throw new Error(error.message);

    await syncCategories(sb, tourId, formData);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath("/admin/tours");
}

export async function publishTour(tourId: string) {
    const sb = supabaseService();
    const { error } = await sb
        .from("tours")
        .update({
            status: "published", published_at: new Date().toISOString()
        })
        .eq("id", tourId);

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath("/tours");
}

export async function publishTourWithSave(tourId: string, formData: FormData) {
    const title   = String(formData.get("title")   || "").trim();
    const summary = String(formData.get("summary") || "");
    const content = String(formData.get("content") || "");

    const sb = supabaseService();
    const { error } = await sb
        .from("tours")
        .update({
            title,
            summary,
            content,
            status: "published",
            published_at: new Date().toISOString(),
        })
        .eq("id", tourId);

    if (error) throw new Error(error.message);

    await syncCategories(sb, tourId, formData);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath("/admin/tours");
    revalidatePath("/tours");
}

export async function unpublishTour(tourId: string) {
    const sb = supabaseService();
    const { error } = await sb
        .from("tours")
        .update({
            status: "draft", published_at: null
        })
        .eq("id", tourId);

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/tours/${tourId}`);
    revalidatePath("/tours");
}