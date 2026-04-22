"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { supabaseService } from "@/lib/supabase/server";
import { SITE_SETTINGS_TAG } from "@/lib/site-settings";

/**
 * Upsert any `site_settings` image URL. `key` is unconstrained so the
 * same action can handle `hero_image`, `logo_image`,
 * `contact_banner_image`, or per-destination keys like
 * `destination_hero_north-europe`.
 */
export async function updateSiteImage(key: string, publicUrl: string) {
    const sb = supabaseService();
    const { error } = await sb.from("site_settings").upsert(
        { key, value: publicUrl, updated_at: new Date().toISOString() },
        { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    revalidateTag(SITE_SETTINGS_TAG, {});

    // If this is a destination hero, refresh that destination page too.
    const destMatch = key.match(/^destination_hero_(.+)$/);
    if (destMatch) {
        revalidatePath(`/destinations/${destMatch[1]}`);
    }
}
