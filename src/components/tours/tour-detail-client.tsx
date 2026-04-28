"use client";

import { useState } from "react";
import { TourTabBar, type TourTab } from "@/components/tours/tab-bar";
import { ItineraryStopCard } from "@/components/tours/itinerary-stop";
import { DepartureTable } from "@/components/tours/departure-table";
import { InquiryForm } from "@/components/tours/inquiry-form";
import type { DepartureRow } from "@/components/tours/data";

export type TourStop = {
  subtheme: string;
  introduction: string | null;
  image_path: string | null;
  icon_path: string | null;
  sort_order: number;
};

type Props = {
  tourId: string | null;
  title: string;
  summary: string | null;
  heroImage: string | null;
  stops: TourStop[];
  departures: DepartureRow[];
};

export function TourDetailClient({
  tourId,
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
            <InquiryForm tourId={tourId} tourTitle={title} />
          </div>
        )}
      </div>
    </>
  );
}
