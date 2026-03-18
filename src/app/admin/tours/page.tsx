import Link from "next/link";
import { supabaseService } from "@/lib/supabase/server";
import { createTour } from "./actions";

export default async function AdminToursPage() {
    const sb = supabaseService();
    const { data: tours, error } = await sb
        .from("tours")
        .select("id, title, slug, status, updated_at")
        .order("updated_at", { ascending: false });

    return (
        <main className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Tours</h1>

            <form action={createTour} className="flex gap-2">
                <input
                    name="title"
                    placeholder="New tour title..."
                    className="border rounded px-3 py-2 w-80"
                />
                <button className="border rounded px-3 py-2">Create draft</button>
            </form>

            <ul className="space-y-2">
                {tours?.map((t) => (
                    <li key={t.id} className="border rounded p-3 flex justify-between">
                        <div>
                            <div className="font-medium">{t.title}</div>
                            <div className="text-sm opacity-70">
                                {t.status} · /tours/{t.slug}
                            </div>
                        </div>
                        <Link className="underline" href={`/admin/tours/${t.id}`}>
                            Edit
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}