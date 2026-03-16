"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import { PageShell } from "@/components/nav/page-shell";
import { TourTabBar, type TourTab } from "@/components/tours/tab-bar";
import { ItineraryStopCard } from "@/components/tours/itinerary-stop";
import { DepartureTable } from "@/components/tours/departure-table";
import { tourDetails } from "@/components/tours/data";

type Props = { params: Promise<{ slug: string }> };

export default function TourDetailPage({ params }: Props) {
  const { slug } = use(params);
  const tour = tourDetails[slug];
  if (!tour) notFound();

  const [activeTab, setActiveTab] = useState<TourTab>("overview");

  return (
    <PageShell>
      {/* ── Hero image ───────────────────────────────────────────────── */}
      <div className="relative h-[260px] overflow-hidden md:h-[440px]">
        <img
          src={tour.heroImage}
          alt={tour.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <TourTabBar activeTab={activeTab} onChange={setActiveTab} />

      {/* ── Tab content — key forces remount → triggers fade-in ──────── */}
      <div key={activeTab} className="animate-tab-fade-in w-full">

        {/* 行程總覽 */}
        {activeTab === "overview" && (
          <div className="mx-auto max-w-[1320px] space-y-10 px-5 pb-16 pt-10 md:space-y-16 md:px-10 md:pb-24 md:pt-14">
            {tour.stops.map((stop) => (
              <ItineraryStopCard key={stop.name} {...stop} />
            ))}
          </div>
        )}

        {/* 出發日＆資訊 */}
        {activeTab === "dates" && (
          <DepartureTable rows={tour.departures} />
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
              {/* 姓名 */}
              <div className="grid grid-cols-[110px_1fr] items-center gap-4">
                <label className="text-right text-[15px] text-black/70">姓名:</label>
                <input
                  type="text"
                  className="h-10 w-full rounded border border-black/10 bg-white/80 px-3 text-[15px] outline-none focus:border-[#e8928a]"
                />
              </div>

              {/* 手機號碼 */}
              <div className="grid grid-cols-[110px_1fr] items-center gap-4">
                <label className="text-right text-[15px] text-black/70">手機號碼:</label>
                <input
                  type="tel"
                  className="h-10 w-full rounded border border-black/10 bg-white/80 px-3 text-[15px] outline-none focus:border-[#e8928a]"
                />
              </div>

              {/* Email */}
              <div className="grid grid-cols-[110px_1fr] items-center gap-4">
                <label className="text-right text-[15px] text-black/70">Email:</label>
                <input
                  type="email"
                  className="h-10 w-full rounded border border-black/10 bg-white/80 px-3 text-[15px] outline-none focus:border-[#e8928a]"
                />
              </div>

              {/* 需求說明 */}
              <div className="grid grid-cols-[110px_1fr] items-start gap-4">
                <label className="pt-2 text-right text-[15px] text-black/70">需求說明:</label>
                <textarea
                  rows={6}
                  className="w-full rounded border border-black/10 bg-white/80 p-3 text-[15px] outline-none focus:border-[#e8928a]"
                />
              </div>

              {/* Privacy checkbox */}
              <div className="flex items-center gap-2 pl-[126px]">
                <input type="checkbox" id="privacy" className="accent-[#e8928a]" />
                <label htmlFor="privacy" className="text-[13px] text-black/60">
                  我已經閱讀
                  <a href="#" className="underline hover:text-[#e8928a]">隱私權政策</a>
                  並同意其內容
                </label>
              </div>

              {/* Submit */}
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
    </PageShell>
  );
}
