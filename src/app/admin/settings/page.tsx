import Link from "next/link";
import { getSiteSettings, FALLBACKS } from "@/lib/site-settings";
import { SiteImageUploader } from "@/components/admin/site-image-uploader";
import { signOut } from "../login/actions";

export default async function AdminSettingsPage() {
    const settings = await getSiteSettings();

    const heroUrl    = settings["hero_image"]           ?? null;
    const logoUrl    = settings["logo_image"]           ?? FALLBACKS["logo_image"];
    const bannerUrl  = settings["contact_banner_image"] ?? null;
    const bookingHeroUrl = settings["booking_explain_hero_image"] ?? null;
    const groupsHeroUrl  = settings["groups_hero_image"]          ?? null;

    return (
        <main className="min-h-screen bg-[#fdf7ee] p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between rounded-xl bg-[#f5ca91]/40 px-5 py-3 border border-[#e8c9a0]">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/tours"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        ← 返回行程管理
                    </Link>
                    <Link
                        href="/admin/destinations"
                        className="rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                    >
                        🏞️ 地區頁面
                    </Link>
                    <h1 className="text-xl font-bold text-[#7a4020]">⚙️ 網站設定</h1>
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

            {/* Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                {/* Hero */}
                <div className="rounded-xl border border-[#e8c9a0] bg-white p-5 space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                            首頁 Hero 圖片
                        </h2>
                        <p className="mt-1 text-xs text-[#7a4020]/60">
                            網站首頁最大的背景照片。建議橫向寬版（16:9），至少 1440×810 px。
                        </p>
                    </div>
                    <SiteImageUploader
                        settingKey="hero_image"
                        label="上傳 Hero 圖片"
                        hint="JPG / PNG / WEBP，建議 16:9"
                        currentUrl={heroUrl}
                    />
                </div>

                {/* Logo */}
                <div className="rounded-xl border border-[#e8c9a0] bg-white p-5 space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                            Logo 圖片
                        </h2>
                        <p className="mt-1 text-xs text-[#7a4020]/60">
                            出現在首頁 Hero 與各內頁 header。建議去背 PNG，高度約 72 px。
                        </p>
                    </div>
                    <SiteImageUploader
                        settingKey="logo_image"
                        label="上傳 Logo"
                        hint="建議去背 PNG"
                        currentUrl={logoUrl}
                    />
                </div>

                {/* Contact banner */}
                <div className="rounded-xl border border-[#e8c9a0] bg-white p-5 space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                            聯絡我們 Banner
                        </h2>
                        <p className="mt-1 text-xs text-[#7a4020]/60">
                            聯絡我們頁面頂部的橫幅圖片。建議橫向（4:1 比例）。
                        </p>
                    </div>
                    <SiteImageUploader
                        settingKey="contact_banner_image"
                        label="上傳聯絡頁 Banner"
                        hint="JPG / PNG / WEBP，建議 4:1"
                        currentUrl={bannerUrl}
                    />
                </div>

                {/* Booking explain hero */}
                <div className="rounded-xl border border-[#e8c9a0] bg-white p-5 space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                            訂票服務說明 Hero
                        </h2>
                        <p className="mt-1 text-xs text-[#7a4020]/60">
                            訂票服務說明頁面頂部的橫幅圖片。建議橫向寬版（16:9）。
                        </p>
                    </div>
                    <SiteImageUploader
                        settingKey="booking_explain_hero_image"
                        label="上傳訂票服務 Hero"
                        hint="JPG / PNG / WEBP，建議 16:9"
                        currentUrl={bookingHeroUrl}
                    />
                </div>

                {/* Groups hero */}
                <div className="rounded-xl border border-[#e8c9a0] bg-white p-5 space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                            團體總列表 Hero
                        </h2>
                        <p className="mt-1 text-xs text-[#7a4020]/60">
                            團體總列表頁面頂部的橫幅圖片。建議橫向寬版（16:9）。
                        </p>
                    </div>
                    <SiteImageUploader
                        settingKey="groups_hero_image"
                        label="上傳團體總列表 Hero"
                        hint="JPG / PNG / WEBP，建議 16:9"
                        currentUrl={groupsHeroUrl}
                    />
                </div>

            </div>
        </main>
    );
}
