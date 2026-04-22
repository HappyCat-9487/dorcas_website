"use server";

import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";

export async function signIn(
    prevState: { error: string | null },
    formData: FormData,
): Promise<{ error: string | null }> {
    const email    = String(formData.get("email")    ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const next     = String(formData.get("next")     ?? "/admin/tours");

    if (!email || !password) {
        return { error: "請輸入電子郵件與密碼。" };
    }

    const supabase = await createAuthServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return { error: "帳號或密碼不正確，請重試。" };
    }

    redirect(next.startsWith("/admin") ? next : "/admin/tours");
}

export async function signOut() {
    const supabase = await createAuthServerClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
}
