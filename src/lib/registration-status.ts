import { supabaseService } from "@/lib/supabase/server";

export type RegistrationStatus = "open" | "full";

/**
 * Compute "open" vs "full" for a single tour.
 * If max is null/undefined → there's no cap, treat as always "open".
 */
export function computeRegistrationStatus(
    maxAttendees: number | null | undefined,
    signedUpCount: number,
): RegistrationStatus {
    if (maxAttendees === null || maxAttendees === undefined) return "open";
    return signedUpCount >= maxAttendees ? "full" : "open";
}

/**
 * Sum of `party_size` for non-cancelled registrations of one tour.
 *
 * Uses the SERVICE ROLE on purpose:
 *   - The `registrations` table has no SELECT policy for anon (we don't want
 *     to leak customer PII), so anon queries return zero rows.
 *   - This helper only returns an aggregated *count*, not any PII, so it's
 *     safe to bypass RLS server-side.
 *
 * Race condition note: capacity is also re-checked inside the server action
 * before INSERT, so two concurrent submissions can't both squeeze into the
 * last seat (the second one will be rejected).
 */
export async function getSignedUpCount(tourId: string): Promise<number> {
    const sb = supabaseService();
    const { data, error } = await sb
        .from("registrations")
        .select("party_size")
        .eq("tour_id", tourId)
        .neq("status", "cancelled");

    if (error || !data) return 0;
    return data.reduce(
        (sum, row: { party_size: number | null }) =>
            sum + (row.party_size ?? 1),
        0,
    );
}

/**
 * Bulk version: returns a map of tourId → signed-up count.
 * Used by /groups/page.tsx so we don't fire one query per row.
 *
 * Same RLS reasoning as getSignedUpCount: uses service role internally.
 */
export async function getSignedUpCounts(
    tourIds: string[],
): Promise<Record<string, number>> {
    if (tourIds.length === 0) return {};

    const sb = supabaseService();
    const { data, error } = await sb
        .from("registrations")
        .select("tour_id, party_size")
        .in("tour_id", tourIds)
        .neq("status", "cancelled");

    if (error || !data) return {};

    const map: Record<string, number> = {};
    for (const row of data as { tour_id: string; party_size: number | null }[]) {
        map[row.tour_id] = (map[row.tour_id] ?? 0) + (row.party_size ?? 1);
    }
    return map;
}
