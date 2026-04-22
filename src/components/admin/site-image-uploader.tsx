"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { updateSiteImage } from "@/app/admin/settings/actions";

type Props = {
    /**
     * Supabase `site_settings` key to upsert into, e.g.
     * `hero_image` or `destination_hero_north-europe`.
     */
    settingKey: string;
    label: string;
    hint: string;
    currentUrl: string | null;
};

function withCacheBuster(url: string) {
    return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
}

export function SiteImageUploader({ settingKey, label, hint, currentUrl }: Props) {
    const [preview, setPreview] = useState<string | null>(currentUrl);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreview(currentUrl ? withCacheBuster(currentUrl) : null);
    }, [currentUrl]);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError("只接受 JPG、PNG 或 WEBP 格式。");
            return;
        }

        setError(null);
        setSaved(false);
        setUploading(true);

        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const storagePath = `${settingKey}-${Date.now()}.${ext}`;
        const sb = supabaseBrowser();

        const { error: uploadErr } = await sb.storage
            .from("site-assets")
            .upload(storagePath, file, { upsert: true });

        if (uploadErr) {
            setError(uploadErr.message);
            setUploading(false);
            return;
        }

        const { data: urlData } = sb.storage.from("site-assets").getPublicUrl(storagePath);
        const publicUrl = urlData.publicUrl;
        setPreview(withCacheBuster(publicUrl));

        startTransition(async () => {
            await updateSiteImage(settingKey, publicUrl);
            setSaved(true);
        });

        setUploading(false);
    }

    return (
        <div className="space-y-3">
            <div>
                <p className="text-sm font-medium text-[#7a4020]">{label}</p>
                <p className="text-xs text-[#7a4020]/50">{hint}</p>
            </div>

            <div className="relative">
                {preview ? (
                    <div
                        className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-[#e8c9a0]"
                        onClick={() => inputRef.current?.click()}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt={label}
                            className="h-48 w-full object-cover transition-opacity group-hover:opacity-75"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-[#7a4020] shadow">
                                點擊更換圖片
                            </span>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8c9a0] bg-[#fdf7ee] text-sm text-[#7a4020]/50 transition-colors hover:border-[#e8928a] hover:bg-[#f5ca91]/10"
                    >
                        <svg className="size-9 text-[#e8928a]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="font-medium">點擊上傳</span>
                        <span className="text-xs opacity-60">JPG / PNG / WEBP</span>
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
            />

            {uploading && <p className="text-xs text-[#e8928a]">⏳ 上傳中，請稍候…</p>}
            {saved && !uploading && <p className="text-xs text-green-600">✓ 已儲存，前台將立即更新。</p>}
            {error && <p className="text-xs text-red-500">⚠️ {error}</p>}
        </div>
    );
}
