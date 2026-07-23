import { redirect } from "next/navigation";

// `/admin` has no dashboard of its own — it's just the entry point. Middleware
// already guarantees the user is authenticated by the time they reach here
// (unauthenticated users are bounced to /admin/login first), so we simply
// forward to the tours management page, which is the real admin home.
export default function AdminIndexPage() {
    redirect("/admin/tours");
}
