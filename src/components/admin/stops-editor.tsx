"use client";

import { useRef, useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { upsertTourStop, deleteTourStop, type TourStopData } from "@/app/admin/tours/actions";

const MAX_STOPS = 6;

type StopRow = {
    id?: string;
    sort_order: number;
    subtheme: string;
    introduction: string;
    image_path: string;
    icon_path: string;
    imagePreview: string;
    iconPreview: string;
    saving: boolean;
    error: string | null;
};

type Props = {
    tourId: string;
    initialStops: {
        id: string;
        sort_order: number;
        subtheme: string;
        introduction: string | null;
        image_path: string | null;
        icon_path: string | null;
    }[];
};

function makeEmpty(sort_order: number): StopRow {
    return {
        sort_order,
        subtheme: "",
        introduction: "",
        image_path: "",
        icon_path: "",
        imagePreview: "",
        iconPreview: "",
        saving: false,
        error: null,
    };
}

export function StopsEditor({ tourId, initialStops }: Props) {
    const [stops, setStops] = useState<StopRow[]>(() =>
        initialStops.length > 0
            ? initialStops.map((s) => ({
                  id: s.id,
                  sort_order: s.sort_order,
                  subtheme: s.subtheme,
                  introduction: s.introduction ?? "",
                  image_path: s.image_path ?? "",
                  icon_path: s.icon_path ?? "",
                  imagePreview: s.image_path ?? "",
                  iconPreview: s.icon_path ?? "",
                  saving: false,
                  error: null,
              }))
            : [makeEmpty(0)],
    );

    const [, startTransition] = useTransition();
    const imageInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const iconInputRefs  = useRef<(HTMLInputElement | null)[]>([]);

    function updateStop(idx: number, patch: Partial<StopRow>) {
        setStops((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
    }

    function addStop() {
        if (stops.length >= MAX_STOPS) return;
        setStops((prev) => [...prev, makeEmpty(prev.length)]);
    }

    async function removeStop(idx: number) {
        const stop = stops[idx];
        if (stop.id) {
            await deleteTourStop(stop.id, tourId);
        }
        setStops((prev) =>
            prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sort_order: i })),
        );
    }

    async function uploadFile(idx: number, file: File, kind: "image" | "icon") {
        const allowed = kind === "image"
            ? ["image/jpeg", "image/png", "image/jpg"]
            : ["image/png"];

        if (!allowed.includes(file.type)) {
            updateStop(idx, {
                error: kind === "icon" ? "Icon 只接受 PNG 格式。" : "只接受 JPG / PNG 格式。",
            });
            return;
        }

        updateStop(idx, { error: null, saving: true });

        const ext = file.name.split(".").pop();
        const storagePath = `stops/${tourId}/${idx}-${kind}.${ext}`;
        const sb = supabaseBrowser();

        const { error: uploadError } = await sb.storage
            .from("tour-assets")
            .upload(storagePath, file, { upsert: true });

        if (uploadError) {
            updateStop(idx, { error: uploadError.message, saving: false });
            return;
        }

        const { data: urlData } = sb.storage
            .from("tour-assets")
            .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        if (kind === "image") {
            updateStop(idx, { image_path: publicUrl, imagePreview: publicUrl, saving: false });
        } else {
            updateStop(idx, { icon_path: publicUrl, iconPreview: publicUrl, saving: false });
        }
    }

    async function saveStop(idx: number) {
        const stop = stops[idx];
        if (!stop.subtheme.trim()) {
            updateStop(idx, { error: "景點名稱不能空白。" });
            return;
        }

        updateStop(idx, { saving: true, error: null });

        const payload: TourStopData = {
            id: stop.id,
            sort_order: idx,
            subtheme: stop.subtheme,
            introduction: stop.introduction,
            image_path: stop.image_path,
            icon_path: stop.icon_path,
        };

        startTransition(async () => {
            try {
                await upsertTourStop(tourId, payload);
                updateStop(idx, { saving: false });
            } catch (e) {
                updateStop(idx, { saving: false, error: String(e) });
            }
        });
    }

    return (
        <div className="space-y-3">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-[#7a4020]/60">
                    最多 {MAX_STOPS} 個景點・已新增{" "}
                    <strong className="text-[#e8928a]">{stops.length}</strong> 個
                </span>
                {stops.length < MAX_STOPS && (
                    <button
                        type="button"
                        onClick={addStop}
                        className="rounded-lg border border-[#e8928a] px-3 py-1 text-xs font-medium text-[#e8928a] transition-colors hover:bg-[#e8928a]/10"
                    >
                        + 新增景點
                    </button>
                )}
            </div>

            {stops.map((stop, idx) => (
                <div
                    key={idx}
                    className="rounded-xl border border-[#e8c9a0] bg-[#fdf7ee] p-4 space-y-3"
                >
                    {/* Stop header */}
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#b83553]">
                            <span className="flex size-5 items-center justify-center rounded-full bg-[#e8928a] text-[10px] text-white">
                                {idx + 1}
                            </span>
                            景點 {idx + 1}
                        </span>
                        <button
                            type="button"
                            onClick={() => removeStop(idx)}
                            className="text-xs text-[#7a4020]/40 hover:text-red-500"
                        >
                            刪除
                        </button>
                    </div>

                    {/* Subtheme */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#7a4020]">
                            景點名稱 <span className="text-[#e8928a]">*</span>
                        </label>
                        <input
                            value={stop.subtheme}
                            onChange={(e) => updateStop(idx, { subtheme: e.target.value })}
                            placeholder="e.g. 維格蘭雕塑公園"
                            className="w-full rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-sm focus:border-[#e8928a] focus:outline-none"
                        />
                    </div>

                    {/* Introduction */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#7a4020]">簡介</label>
                        <textarea
                            value={stop.introduction}
                            onChange={(e) => updateStop(idx, { introduction: e.target.value })}
                            rows={3}
                            placeholder="這個景點的短介紹..."
                            className="w-full rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-sm focus:border-[#e8928a] focus:outline-none"
                        />
                    </div>

                    {/* Image + Icon uploads */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Stop image */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[#7a4020]">
                                景點圖片
                                <span className="ml-1 text-[10px] text-[#7a4020]/40">JPG/PNG</span>
                            </label>
                            {stop.imagePreview ? (
                                <div
                                    className="group relative cursor-pointer overflow-hidden rounded-lg border-2 border-[#e8c9a0]"
                                    onClick={() => imageInputRefs.current[idx]?.click()}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={stop.imagePreview}
                                        alt="stop preview"
                                        className="h-24 w-full object-cover transition-opacity group-hover:opacity-75"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="rounded bg-white/90 px-2 py-0.5 text-[10px] text-[#7a4020]">
                                            更換
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => imageInputRefs.current[idx]?.click()}
                                    className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#e8c9a0] bg-white text-xs text-[#7a4020]/40 transition-colors hover:border-[#e8928a] hover:bg-[#f5ca91]/10"
                                >
                                    <svg className="size-5 text-[#e8928a]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    上傳圖片
                                </button>
                            )}
                            <input
                                ref={(el) => { imageInputRefs.current[idx] = el; }}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadFile(idx, file, "image");
                                }}
                            />
                        </div>

                        {/* Icon (PNG only) */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[#7a4020]">
                                小圖示 Icon
                                <span className="ml-1 text-[10px] text-[#7a4020]/40">PNG</span>
                            </label>
                            {stop.iconPreview ? (
                                <div
                                    className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-[#e8c9a0] bg-white transition-colors hover:border-[#e8928a]"
                                    onClick={() => iconInputRefs.current[idx]?.click()}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={stop.iconPreview}
                                        alt="icon preview"
                                        className="size-12 object-contain"
                                    />
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => iconInputRefs.current[idx]?.click()}
                                    className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#e8c9a0] bg-white text-xs text-[#7a4020]/40 transition-colors hover:border-[#e8928a] hover:bg-[#f5ca91]/10"
                                >
                                    <svg className="size-5 text-[#e8928a]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    上傳 Icon
                                </button>
                            )}
                            <input
                                ref={(el) => { iconInputRefs.current[idx] = el; }}
                                type="file"
                                accept="image/png"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadFile(idx, file, "icon");
                                }}
                            />
                        </div>
                    </div>

                    {stop.error && (
                        <p className="text-xs text-red-500">⚠️ {stop.error}</p>
                    )}

                    {/* Save button */}
                    <button
                        type="button"
                        onClick={() => saveStop(idx)}
                        disabled={stop.saving}
                        className="w-full rounded-lg bg-[#e8928a] py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                        {stop.saving ? "⏳ 儲存中..." : "儲存此景點"}
                    </button>
                </div>
            ))}
        </div>
    );
}
