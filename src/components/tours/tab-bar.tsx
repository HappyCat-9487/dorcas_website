"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type TourTab = "overview" | "dates" | "consultation";

type Props = {
  activeTab: TourTab;
  onChange: (tab: TourTab) => void;
};

const tabs: { id: TourTab; label: string }[] = [
  { id: "overview",     label: "行程總覽" },
  { id: "dates",        label: "出發日＆資訊" },
  { id: "consultation", label: "行程諮詢" },
];

export function TourTabBar({ activeTab, onChange }: Props) {
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div className="relative z-10 w-full border-y border-black/10">

      {/* Tab buttons */}
      <div className="grid grid-cols-3">
        {tabs.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={cn(
                "py-4 text-[15px] font-semibold transition-colors md:py-5 md:text-[18px]",
                "border-r border-black/10 last:border-r-0",
                isActive
                  ? "bg-[#e8928a] text-white"
                  : "bg-[#e8c9a0] text-black/70 hover:bg-[#ddb88a]",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Sliding double-chevron indicator — glides to the active tab */}
      <div
        className="pointer-events-none absolute bottom-0 w-1/3 transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      >
        <div className="flex translate-y-1/2 justify-center gap-0.5">
          <ChevronDown strokeWidth={3} className="size-5 text-[#e8928a]" />
          <ChevronDown strokeWidth={3} className="size-5 text-[#e8928a]" />
        </div>
      </div>

    </div>
  );
}
