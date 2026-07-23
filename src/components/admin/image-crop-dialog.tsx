"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

export type CropMimeType = "image/jpeg" | "image/png";

/**
 * Optional overlays on the crop area so admins see what the front-end will
 * cover (wave at the bottom, header / title band at the top).
 *
 * Percentages are of the crop rectangle height (0–100).
 * The wave SVG path mirrors the homepage / destination hero cutout.
 */
export type FrontendMask = {
    kind: "wave";
    /** 0–100; % of crop area height the wave occupies (from bottom). */
    heightPercent: number;
    /**
     * Optional top band (logo / region tabs / destination title overlay).
     * When set, a semi-transparent bar is drawn from the top of the crop.
     */
    topHeightPercent?: number;
    color?: string;
    label?: string;
    topLabel?: string;
};

type Props = {
    /** The picked File (we read it as a data URL internally). */
    file: File;
    /** Aspect ratio expressed as width / height. e.g. 16/9, 4/3, 1. */
    aspect: number;
    /** Output MIME. Use "image/png" if the image needs transparency (icons). */
    outputType: CropMimeType;
    /**
     * Output longest-side cap, in pixels. We resize down to keep file size
     * sensible. Defaults to 2000.
     */
    maxOutputPx?: number;
    /** JPEG quality (ignored for PNG). 0–1. Defaults to 0.9. */
    quality?: number;
    /** Heading shown at the top of the dialog (e.g. "裁切封面圖（16:9）"). */
    title: string;
    /** Optional preview overlay to show what the front-end will hide. */
    frontendMask?: FrontendMask;
    /** Called with the cropped result as a File (same name, new blob). */
    onConfirm: (cropped: File) => void;
    onCancel: () => void;
};

export function ImageCropDialog({
    file,
    aspect,
    outputType,
    maxOutputPx = 2000,
    quality = 0.9,
    title,
    frontendMask,
    onConfirm,
    onCancel,
}: Props) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [working, setWorking] = useState(false);

    useEffect(() => {
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(file);
    }, [file]);

    const onCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    async function handleConfirm() {
        if (!imageSrc || !croppedAreaPixels) return;
        setWorking(true);
        try {
            const blob = await getCroppedBlob(
                imageSrc,
                croppedAreaPixels,
                outputType,
                maxOutputPx,
                quality,
            );
            const ext = outputType === "image/png" ? "png" : "jpg";
            const base = (file.name.split(".").slice(0, -1).join(".") || file.name).replace(/[^\w\-]+/g, "_");
            const out = new File([blob], `${base}.${ext}`, { type: outputType });
            onConfirm(out);
        } finally {
            setWorking(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
                    <h3 className="text-base font-semibold text-[#7a4020]">{title}</h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm text-black/40 hover:text-black/70"
                        aria-label="關閉"
                    >
                        ✕
                    </button>
                </div>

                <div className="relative h-[60vh] max-h-[480px] w-full bg-[#1c1c1c]">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            objectFit="contain"
                        />
                    )}
                    {frontendMask?.kind === "wave" && (
                        <HeroMaskPreview
                            aspect={aspect}
                            bottomHeightPercent={frontendMask.heightPercent}
                            topHeightPercent={frontendMask.topHeightPercent}
                            color={frontendMask.color ?? "rgba(245, 202, 145, 0.78)"}
                            bottomLabel={
                                frontendMask.label ??
                                "前台這塊會被波浪蓋住（重要構圖請放在中間）"
                            }
                            topLabel={
                                frontendMask.topLabel ??
                                "前台這塊會被標題／導覽蓋住（重要構圖請往下移）"
                            }
                        />
                    )}
                </div>

                <div className="space-y-3 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <span className="w-12 shrink-0 text-xs text-[#7a4020]/70">縮放</span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 accent-[#e8928a]"
                        />
                        <span className="w-12 shrink-0 text-right text-xs text-[#7a4020]/60">
                            {zoom.toFixed(1)}×
                        </span>
                    </div>

                    <p className="text-[11px] text-[#7a4020]/60">
                        提示：拖曳圖片可以調整位置，移動滑桿可以放大；框內就是最終會儲存的範圍。
                    </p>

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={working}
                            className="rounded-lg border border-[#e8c9a0] px-4 py-1.5 text-sm text-[#7a4020] transition-colors hover:bg-[#fdf7ee] disabled:opacity-50"
                        >
                            取消
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={working || !croppedAreaPixels}
                            className="rounded-lg bg-[#e8928a] px-5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                            {working ? "處理中…" : "確認裁切"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────
// Hero mask preview — top band (logo / tabs / destination title) +
// bottom wave cutout. Overlays sit on the crop rectangle so admins
// keep important composition in the visible "safe" middle zone.
// ─────────────────────────────────────────────────────────────────────

function HeroMaskPreview({
    aspect,
    bottomHeightPercent,
    topHeightPercent,
    color,
    bottomLabel,
    topLabel,
}: {
    aspect: number;
    bottomHeightPercent: number;
    topHeightPercent?: number;
    color: string;
    bottomLabel: string;
    topLabel: string;
}) {
    // The Cropper sizes the crop rectangle to fit the container while
    // respecting the aspect. We mirror that here with `aspect-ratio` so the
    // overlay sits exactly on top of the crop rectangle.
    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
                className="relative w-[90%] max-w-full"
                style={{ aspectRatio: `${aspect}` }}
            >
                {/* Top blocked zone — pink header / logo / destination title */}
                {typeof topHeightPercent === "number" && topHeightPercent > 0 && (
                    <div
                        className="absolute left-0 right-0 top-0 flex items-end justify-center overflow-hidden"
                        style={{
                            height: `${topHeightPercent}%`,
                            background:
                                "linear-gradient(180deg, rgba(210,106,106,0.82) 0%, rgba(210,106,106,0.55) 70%, rgba(210,106,106,0.25) 100%)",
                        }}
                    >
                        <p className="mb-1 whitespace-nowrap rounded bg-black/55 px-2 py-0.5 text-[11px] text-white">
                            {topLabel}
                        </p>
                    </div>
                )}

                {/* Bottom wave cutout */}
                <div
                    className="absolute bottom-0 left-0 right-0 overflow-hidden"
                    style={{ height: `${bottomHeightPercent}%` }}
                >
                    <svg
                        viewBox="0 0 1440 130"
                        preserveAspectRatio="none"
                        className="block h-full w-full"
                        aria-hidden="true"
                    >
                        <path
                            d="M0,80 C200,20 480,110 720,60 C960,10 1200,90 1440,50 L1440,130 L0,130 Z"
                            fill={color}
                        />
                    </svg>
                    <p className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/55 px-2 py-0.5 text-[11px] text-white">
                        {bottomLabel}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────
// Canvas helpers
// ─────────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}

async function getCroppedBlob(
    imageSrc: string,
    crop: Area,
    type: CropMimeType,
    maxOutputPx: number,
    quality: number,
): Promise<Blob> {
    const img = await loadImage(imageSrc);

    // The crop coordinates are in the natural pixel space of the source image.
    // Optionally downscale the output so very large originals don't produce
    // huge files.
    let outW = crop.width;
    let outH = crop.height;
    const longest = Math.max(outW, outH);
    if (longest > maxOutputPx) {
        const ratio = maxOutputPx / longest;
        outW = Math.round(outW * ratio);
        outH = Math.round(outH * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width  = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
        img,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, outW, outH,
    );

    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
            type,
            type === "image/jpeg" ? quality : undefined,
        );
    });
}
