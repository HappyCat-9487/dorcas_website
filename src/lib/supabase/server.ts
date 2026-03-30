import { createClient } from "@supabase/supabase-js";

export function supabaseAnon() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}

// backend access (server only)
export function supabaseService() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (server actions need the service role key).",
        );
    }
    return createClient(url, key, {
        auth: { persistSession: false },
    });
}