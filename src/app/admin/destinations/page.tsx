import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import {
    destinations,
    destinationHeroKey,
} from "@/components/destinations/constants";
import { SiteImageUploader } from "@/components/admin/site-image-uploader";
import { signOut } from "../login/actions";

export default async function AdminDestinationsPage() {
    const settings = await getSiteSettings();

    // Group destinations by parent region for a tidy admin layout.
    const groups = destinations.reduce<
        Record<string, typeof destinations>
    >((acc, d) => {
        (acc[d.parentRegion] ??= []).push(d);
        return acc;
    }, {});

    return (
        <main className="min-h-screen bg-[#fdf7ee] p-6 space-y-5">
            {/* ── Header bar ──────────────────────────────────────── */}
            <div className="flex items-center justify-between rounded-xl border border-[#e8c9a0] bg-[#f5ca91]/40 px-5 py-3">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/tours"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        ← 返回行程管理
                    </Link>
                    <h1 className="text-xl font-bold text-[#7a4020]">
                        🏞️ 地區頁面管理
                    </h1>
                </div>
                <form action={signOut}>
                    <button
                        type="submit"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        登出
                    </button>
                </form>
            </div>

            <div className="rounded-xl border border-[#e8c9a0] bg-white p-4 text-sm text-[#7a4020]/70">
                <p>
                    以下每個地區頁面都有一張「Hero 橫幅」圖片，會顯示在該地區行程列表的最上方。
                    建議橫向寬版（16:9），至少 1440×810 px。未上傳時會使用預設圖片。
                </p>
                <p className="mt-1 text-xs opacity-70">
                    前台路徑：<code>/destinations/&lt;slug&gt;</code>
                </p>
            </div>

            {/* ── Destination groups ──────────────────────────────── */}
            {Object.entries(groups).map(([parentRegion, list]) => (
                <section
                    key={parentRegion}
                    className="rounded-xl border border-[#e8c9a0] bg-white p-5"
                >
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                        {parentRegion}
                    </h2>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {list.map((d) => {
                            const key = destinationHeroKey(d.slug);
                            const currentUrl = settings[key] ?? null;
                            return (
                                <div
                                    key={d.slug}
                                    className="rounded-lg border border-[#f0e0c8] bg-[#fdf7ee] p-4 space-y-3"
                                >
                                    <div className="flex items-baseline justify-between">
                                        <h3 className="text-base font-semibold text-[#7a4020]">
                                            {d.name}
                                        </h3>
                                        <Link
                                            href={`/destinations/${d.slug}`}
                                            target="_blank"
                                            className="text-[11px] text-[#7a4020]/50 hover:text-[#e8928a] hover:underline"
                                        >
                                            /destinations/{d.slug} ↗
                                        </Link>
                                    </div>
                                    <SiteImageUploader
                                        settingKey={key}
                                        label="Hero 橫幅圖片"
                                        hint="JPG / PNG / WEBP，建議 16:9"
                                        currentUrl={currentUrl}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}
        </main>
    );
}
