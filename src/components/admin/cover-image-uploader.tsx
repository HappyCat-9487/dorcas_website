"use client";

import { useRef, useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { upsertCoverImage } from "@/app/admin/tours/actions";

type Props = {
    tourId: string;
    currentPath?: string | null;
};

export function CoverImageUploader({ tourId, currentPath }: Props) {
    const [preview, setPreview] = useState<string | null>(currentPath ?? null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowed.includes(file.type)) {
            setError("只接受 JPG / PNG 格式。");
            return;
        }

        setError(null);
        setUploading(true);

        const ext = file.name.split(".").pop();
        const storagePath = `covers/${tourId}/cover.${ext}`;
        const sb = supabaseBrowser();

        const { error: uploadError } = await sb.storage
            .from("tour-assets")
            .upload(storagePath, file, { upsert: true });

        if (uploadError) {
            setError(uploadError.message);
            setUploading(false);
            return;
        }

        const { data: urlData } = sb.storage
            .from("tour-assets")
            .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;
        setPreview(publicUrl);

        startTransition(async () => {
            await upsertCoverImage(tourId, publicUrl, file.name);
        });

        setUploading(false);
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-[#7a4020]/60">JPG 或 PNG，建議 16:9</span>
                {preview && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="text-xs font-medium text-[#e8928a] hover:underline"
                    >
                        換圖
                    </button>
                )}
            </div>

            {preview ? (
                <div
                    className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-[#e8c9a0]"
                    onClick={() => inputRef.current?.click()}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt="Cover preview"
                        className="h-52 w-full object-cover transition-opacity group-hover:opacity-80"
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
                    className="flex h-52 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e8c9a0] bg-[#fdf7ee] text-sm text-[#7a4020]/50 transition-colors hover:border-[#e8928a] hover:bg-[#f5ca91]/10"
                >
                    <svg
                        className="size-9 text-[#e8928a]/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                    </svg>
                    <span className="font-medium">點擊上傳封面圖片</span>
                    <span className="text-xs opacity-60">JPG / PNG</span>
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={handleFileChange}
            />

            {uploading && (
                <p className="text-xs text-[#e8928a]">⏳ 上傳中，請稍候...</p>
            )}
            {error && (
                <p className="text-xs text-red-500">⚠️ {error}</p>
            )}
        </div>
    );
}
