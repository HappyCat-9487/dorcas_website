"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { regionDropdowns } from "@/components/home/constants";

/**
 * Horizontal, functional tour search bar shown in the home hero's sandy zone.
 *
 * Fields:
 *   - Departure date / Return date   (free dates)
 *   - Duration   (5 天以下 / 6–9 天 / 10 天以上)
 *   - Destination   (flat list of all destination categories grouped by region)
 *   - Keyword    (matched against title + summary)
 *
 * Submits to /search?start=…&end=…&days=…&dest=…&q=…
 */
export function SearchPanel() {
  const router = useRouter();
  const [startDate,   setStartDate]   = useState("");
  const [endDate,     setEndDate]     = useState("");
  const [duration,    setDuration]    = useState("");
  const [destination, setDestination] = useState("");
  const [keyword,     setKeyword]     = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (startDate)   params.set("start", startDate);
    if (endDate)     params.set("end",   endDate);
    if (duration)    params.set("days",  duration);
    if (destination) params.set("dest",  destination);
    if (keyword.trim()) params.set("q",  keyword.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-[28px] bg-[#fdf7ee] px-5 py-5 shadow-md ring-1 ring-[#e8c9a0]/60 md:px-7 md:py-6"
    >
      {/* Header row: title + submit button (horizontal on md+) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-5">
        <h3 className="flex items-center gap-2 text-[22px] font-semibold tracking-tight text-[#7a4020] md:text-[26px]">
          行程搜尋
        </h3>
        <button
          type="submit"
          className="rounded-full bg-[#d26a6a] px-7 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 md:px-9 md:text-base"
        >
          搜尋
        </button>
      </div>

      {/* Fields row: stacks on mobile, horizontal on md+ */}
      <div className="grid gap-4 md:grid-cols-[1.7fr_0.9fr_1.2fr_1.2fr] md:items-end md:gap-4">
        <Field label="出發日期／返回日期">
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputCls}
              aria-label="出發日期"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputCls}
              aria-label="返回日期"
            />
          </div>
        </Field>

        <Field label="旅遊天數">
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={inputCls}
          >
            <option value="">不限天數</option>
            <option value="short">5 天以下</option>
            <option value="medium">6–9 天</option>
            <option value="long">10 天以上</option>
          </select>
        </Field>

        <Field label="目的地">
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={inputCls}
          >
            <option value="">請選擇區域／地區</option>
            {Object.entries(regionDropdowns).map(([region, items]) => (
              <optgroup key={region} label={region}>
                {items.map((item) => {
                  const slug = item.href.replace("/destinations/", "");
                  return (
                    <option key={slug} value={slug}>
                      {region}・{item.label}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </Field>

        <Field label="關鍵字">
          <input
            type="text"
            placeholder="景點、城市、主題…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-full border border-[#e8c9a0] bg-white px-4 text-sm text-[#5a3e28] placeholder:text-[#b5936f] focus:border-[#d26a6a] focus:outline-none focus:ring-2 focus:ring-[#d26a6a]/30";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#7a4020] md:text-[14px]">
        <span className="text-[#d26a6a]">▶</span>
        {label}
      </span>
      {children}
    </label>
  );
}
