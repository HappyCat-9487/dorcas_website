import { unstable_cache } from "next/cache";
import { supabaseService } from "./supabase/server";

export const SITE_SETTINGS_TAG = "site_settings";

/** Fallback values shown before anything is uploaded. */
export const FALLBACKS = {
    hero_image:           null as string | null,
    logo_image:           "/figures/logo-removebg.png",
    contact_banner_image: null as string | null,
    booking_explain_hero_image: null as string | null,
    groups_hero_image:          null as string | null,
} as const;

export type SiteSettingKey = keyof typeof FALLBACKS;

async function fetchAllSettings(): Promise<Record<string, string | null>> {
    const sb = supabaseService();
    const { data } = await sb.from("site_settings").select("key, value");
    const map: Record<string, string | null> = {};
    for (const row of data ?? []) map[row.key] = row.value ?? null;
    return map;
}

/**
 * Cached across requests; invalidated by revalidateTag(SITE_SETTINGS_TAG)
 * whenever the admin saves a new image.
 */
export const getSiteSettings = unstable_cache(
    fetchAllSettings,
    [SITE_SETTINGS_TAG],
    { tags: [SITE_SETTINGS_TAG] },
);

export async function getSiteSetting(key: SiteSettingKey): Promise<string | null> {
    const settings = await getSiteSettings();
    return settings[key] ?? FALLBACKS[key];
}

/**
 * Fetch an arbitrary site_settings value (e.g. a destination hero key).
 * Returns `null` if the key has never been set.
 */
export async function getSettingValue(key: string): Promise<string | null> {
    const settings = await getSiteSettings();
    return settings[key] ?? null;
}
