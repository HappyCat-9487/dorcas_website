import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAuthMiddlewareClient } from "@/lib/supabase/auth";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({ request });
    const supabase = createAuthMiddlewareClient(request, response);

    // Refresh the session (keeps cookies up to date).
    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Let the login page through always.
    if (pathname.startsWith("/admin/login")) {
        // If already logged in, go straight to admin dashboard.
        if (user) {
            return NextResponse.redirect(new URL("/admin/tours", request.url));
        }
        return response;
    }

    // Protect all other /admin/* routes.
    if (pathname.startsWith("/admin")) {
        if (!user) {
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("next", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return response;
}

export const config = {
    matcher: ["/admin/:path*"],
};
