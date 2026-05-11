"use server";

import { revalidatePath } from "next/cache";
import { supabaseService } from "@/lib/supabase/server";

type RegStatus = "pending" | "confirmed" | "cancelled";

async function setStatus(id: string, status: RegStatus) {
    const sb = supabaseService();
    const { error } = await sb
        .from("registrations")
        .update({ status })
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/registrations");
}

export async function confirmRegistration(id: string) {
    await setStatus(id, "confirmed");
}

export async function cancelRegistration(id: string) {
    await setStatus(id, "cancelled");
}

/** "Restore" = move a cancelled row back to pending (still occupies a seat). */
export async function restoreRegistration(id: string) {
    await setStatus(id, "pending");
}

export async function deleteRegistration(id: string) {
    const sb = supabaseService();
    const { error } = await sb
        .from("registrations")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/registrations");
}
