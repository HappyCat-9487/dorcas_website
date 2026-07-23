"use client";

import { useEffect, useRef, useState } from "react";
// CSS is fine at module top — it doesn't touch `window`.
import "leaflet/dist/leaflet.css";
import "@maptiler/sdk/dist/maptiler-sdk.css";

type Stop = {
    name: string;
    latitude: number;
    longitude: number;
    order: number;
};

type Props = {
    stops: Stop[];
};

/**
 * Interactive Leaflet map with numbered markers for each tour stop.
 *
 * Leaflet / MapTiler touch `window` at import time → we only import them
 * inside useEffect (browser). Never import them at module top.
 *
 * Basemap:
 * - With `NEXT_PUBLIC_MAPTILER_KEY` → MapTiler vector tiles in 繁體中文
 * - Without key → free OpenStreetMap fallback
 *
 * Scroll zoom: Google Maps style — hold Ctrl (Windows) / ⌘ (Mac) + scroll.
 */
export function TourMap({ stops }: Props) {
    if (stops.length === 0) return null;
    return <MapInner stops={stops} />;
}

function MapInner({ stops }: { stops: Stop[] }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [hintVisible, setHintVisible] = useState(false);
    const [isMac, setIsMac] = useState(false);
    const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || stops.length === 0) return;

        let disposed = false;
        let map: import("leaflet").Map | null = null;
        let onWheel: ((e: WheelEvent) => void) | null = null;

        void (async () => {
            const L = (await import("leaflet")).default;
            if (disposed || !containerRef.current) return;

            const instance = L.map(containerRef.current, {
                scrollWheelZoom: false,
                zoomControl: true,
            });
            map = instance;

            const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();

            if (apiKey) {
                // MapTiler vector tiles with Traditional Chinese labels.
                const { MaptilerLayer, Language, MapStyle } = await import(
                    "@maptiler/leaflet-maptilersdk"
                );

                if (disposed) {
                    instance.remove();
                    map = null;
                    return;
                }

                new MaptilerLayer({
                    apiKey,
                    style: MapStyle.STREETS,
                    language: Language.TRADITIONAL_CHINESE,
                }).addTo(instance);
            } else {
                // Free fallback when no MapTiler key is configured.
                L.tileLayer(
                    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    {
                        attribution:
                            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
                        maxZoom: 18,
                    },
                ).addTo(instance);
            }

            const markers: import("leaflet").Marker[] = [];

            for (const stop of stops) {
                const icon = L.divIcon({
                    html: `<div style="
                        width:28px;height:28px;border-radius:50%;
                        background:#e8928a;color:white;
                        display:flex;align-items:center;justify-content:center;
                        font-size:13px;font-weight:700;
                        border:2px solid white;
                        box-shadow:0 2px 6px rgba(0,0,0,0.3);
                    ">${stop.order}</div>`,
                    className: "",
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                });

                markers.push(
                    L.marker([stop.latitude, stop.longitude], { icon })
                        .addTo(instance)
                        .bindPopup(
                            `<strong style="font-size:14px">${stop.order}. ${escapeHtml(stop.name)}</strong>`,
                        ),
                );
            }

            if (stops.length === 1) {
                instance.setView([stops[0].latitude, stops[0].longitude], 13);
            } else {
                instance.fitBounds(L.featureGroup(markers).getBounds().pad(0.15));
                L.polyline(
                    stops.map((s) => [s.latitude, s.longitude] as [number, number]),
                    {
                        color: "#e8928a",
                        weight: 2,
                        dashArray: "6 8",
                        opacity: 0.7,
                    },
                ).addTo(instance);
            }

            if (disposed) {
                instance?.remove();
                map = null;
                return;
            }

            // Ctrl (Win) / ⌘ (Mac) + wheel → zoom. Otherwise page scrolls.
            onWheel = (e: WheelEvent) => {
                const mac = /Mac|iPhone|iPad/.test(navigator.platform);
                const modifierHeld = mac ? e.metaKey : e.ctrlKey;

                if (!modifierHeld) {
                    setHintVisible(true);
                    if (hintTimer.current) clearTimeout(hintTimer.current);
                    hintTimer.current = setTimeout(() => setHintVisible(false), 1800);
                    return;
                }

                e.preventDefault();
                const delta = e.deltaY > 0 ? -1 : 1;
                instance.setZoom(instance.getZoom() + delta, { animate: false });
            };

            el.addEventListener("wheel", onWheel, { passive: false });
        })();

        return () => {
            disposed = true;
            if (hintTimer.current) clearTimeout(hintTimer.current);
            if (onWheel) el.removeEventListener("wheel", onWheel);
            map?.remove();
            map = null;
        };
    }, [stops]);

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#7a4020]">行程地圖</h3>
            <div className="relative">
                <div
                    ref={containerRef}
                    className="h-[350px] w-full overflow-hidden rounded-2xl border-[3px] border-[#c0445c] shadow-[4px_4px_0px_#c0445c] md:h-[460px]"
                />
                {hintVisible && (
                    <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center">
                        <div className="rounded-lg bg-black/70 px-4 py-2 text-sm text-white shadow-lg">
                            {isMac
                                ? "按住 ⌘ + 滾輪即可縮放地圖"
                                : "按住 Ctrl + 滾輪即可縮放地圖"}
                        </div>
                    </div>
                )}
            </div>
            <p className="text-center text-xs text-[#7a4020]/40">
                地圖標記依景點順序排列 · 可拖曳移動 ·{" "}
                {isMac ? "⌘" : "Ctrl"} + 滾輪縮放
            </p>
        </div>
    );
}

function escapeHtml(s: string) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
