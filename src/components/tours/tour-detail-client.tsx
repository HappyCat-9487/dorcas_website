"use client";

import { useState } from "react";
import { TourTabBar, type TourTab } from "@/components/tours/tab-bar";
import { ItineraryStopCard } from "@/components/tours/itinerary-stop";
import { DepartureTable } from "@/components/tours/departure-table";
import type { DepartureRow } from "@/components/tours/data";

export type TourStop = {
  subtheme: string;
  introduction: string | null;
  image_path: string | null;
  icon_path: string | null;
  sort_order: number;
};

type Props = {
  title: string;
  summary: string | null;
  heroImage: string | null;
  stops: TourStop[];
  departures: DepartureRow[];
};

export function TourDetailClient({
  title,
  summary,
  heroImage,
  stops,
  departures,
}: Props) {
  const [activeTab, setActiveTab] = useState<TourTab>("overview");

  return (
    <>
      {/* ── Hero image ─────────────────────────────────────────────────── */}
      <div className="relative h-[260px] overflow-hidden md:h-[440px]">
        {heroImage ? (
          <img
            src={heroImage}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />

        {/* Title + summary overlay (price / travel dates now live in
            the 出發日＆資訊 tab table below). */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 text-white">
          <h1 className="text-[22px] font-bold drop-shadow md:text-[32px]">{title}</h1>
          {summary && (
            <p className="mt-2 max-w-xl text-[13px] opacity-85 md:text-[15px]">{summary}</p>
          )}
        </div>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────── */}
      <TourTabBar activeTab={activeTab} onChange={setActiveTab} />

      {/* ── Tab content ────────────────────────────────────────────────── */}
      <div key={activeTab} className="animate-tab-fade-in w-full">

        {/* 行程總覽 */}
        {activeTab === "overview" && (
          <div className="mx-auto max-w-[1320px] space-y-10 px-5 pb-16 pt-10 md:space-y-16 md:px-10 md:pb-24 md:pt-14">
            {stops.length > 0 ? (
              (() => {
                let lastIcon: string | undefined;
                return stops.map((stop, i) => {
                  const own = stop.icon_path?.trim();
                  const iconUrl = own ? own : lastIcon;
                  if (own) lastIcon = own;
                  return (
                <ItineraryStopCard
                  key={stop.subtheme + i}
                  name={stop.subtheme}
                  description={stop.introduction ?? ""}
                  imageUrl={stop.image_path ?? ""}
                  iconUrl={iconUrl ?? undefined}
                  reverse={i % 2 === 1}
                />
                  );
                });
              })()
            ) : (
              <p className="text-center text-gray-400">行程景點尚未新增。</p>
            )}
          </div>
        )}

        {/* 出發日＆資訊 */}
        {activeTab === "dates" && (
          <DepartureTable rows={departures} />
        )}

        {/* 行程諮詢 */}
        {activeTab === "consultation" && (
          <div className="w-full bg-[#f0d5a8] px-6 py-10 md:px-16 md:py-14">
            <h2 className="mb-8 text-[28px] font-bold text-[#e8928a] md:text-[36px]">
              行程諮詢
            </h2>
            <form
              className="mx-auto max-w-2xl space-y-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-[110px_1fr] items-center gap-4">
                <label className="text-right text-[15px] text-black/70">姓名:</label>
                <input
                  type="text"
                  className="h-10 w-full rounded border border-black/10 bg-white/80 px-3 text-[15px] outline-none focus:border-[#e8928a]"
                />
              </div>
              <div className="grid grid-cols-[110px_1fr] items-center gap-4">
                <label className="text-right text-[15px] text-black/70">手機號碼:</label>
                <input
                  type="tel"
                  className="h-10 w-full rounded border border-black/10 bg-white/80 px-3 text-[15px] outline-none focus:border-[#e8928a]"
                />
              </div>
              <div className="grid grid-cols-[110px_1fr] items-center gap-4">
                <label className="text-right text-[15px] text-black/70">Email:</label>
                <input
                  type="email"
                  className="h-10 w-full rounded border border-black/10 bg-white/80 px-3 text-[15px] outline-none focus:border-[#e8928a]"
                />
              </div>
              <div className="grid grid-cols-[110px_1fr] items-start gap-4">
                <label className="pt-2 text-right text-[15px] text-black/70">需求說明:</label>
                <textarea
                  rows={6}
                  className="w-full rounded border border-black/10 bg-white/80 p-3 text-[15px] outline-none focus:border-[#e8928a]"
                />
              </div>
              <div className="flex items-center gap-2 pl-[126px]">
                <input type="checkbox" id="privacy" className="accent-[#e8928a]" />
                <label htmlFor="privacy" className="text-[13px] text-black/60">
                  我已經閱讀
                  <a href="#" className="underline hover:text-[#e8928a]">隱私權政策</a>
                  並同意其內容
                </label>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[#e8928a] px-12 py-3 text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  送出
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
