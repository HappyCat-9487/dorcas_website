import { createServerClient } from "@supabase/ssr";
import { createBrowserClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

const url  = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Use inside Server Components and Server Actions. */
export async function createAuthServerClient() {
    const cookieStore = await cookies();
    return createServerClient(url(), anon(), {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(toSet) {
                try {
                    toSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options),
                    );
                } catch {
                    // Server Component — can't set cookies; middleware will refresh.
                }
            },
        },
    });
}

/** Use in Client Components (browser only). */
export function createAuthBrowserClient() {
    return createBrowserClient(url(), anon());
}

/** Use inside middleware only — requires request + response. */
export function createAuthMiddlewareClient(
    request: NextRequest,
    response: NextResponse,
) {
    return createServerClient(url(), anon(), {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(toSet) {
                toSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value),
                );
                toSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options),
                );
            },
        },
    });
}
