"use client";

import { useEffect, useRef, useState } from "react";
import { regionTabs, regionDropdowns } from "@/components/home/constants";

export function RegionTabs() {
  const [openTab, setOpenTab] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenTab(null);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenTab(null);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  function toggle(tab: string) {
    setOpenTab((prev) => (prev === tab ? null : tab));
  }

  return (
    <nav
      ref={navRef}
      className="flex items-start gap-1.5 overflow-x-auto pb-1 md:justify-center md:overflow-visible md:pb-0"
    >
      {regionTabs.map((tab) => {
        const items = regionDropdowns[tab] ?? [];
        const isOpen = openTab === tab;

        return (
          /* Each tab gets its own relative anchor so the dropdown sits under it */
          <div key={tab} className="relative shrink-0">
            <button
              onClick={() => toggle(tab)}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              className={`flex h-[40px] min-w-[74px] items-center justify-center gap-1 rounded-2xl border-2 border-black px-3 text-[11px] font-semibold text-[#ef941b] shadow-[0_3px_4px_rgba(0,0,0,0.25)] transition-colors duration-300 md:h-[52px] md:min-w-[102px] md:px-4 md:text-sm ${
                isOpen ? "bg-white/80" : "bg-[#d9d9d9] hover:bg-neutral-100"
              }`}
            >
              {tab}
              <span
                className={`text-[7px] transition-transform duration-300 md:text-[9px] ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                ▼
              </span>
            </button>

            {/* Dropdown anchored directly below this button */}
            <div
              role="listbox"
              aria-label={tab}
              style={{ transitionDuration: "300ms" }}
              className={`absolute left-0 top-full z-50 mt-1.5 min-w-full overflow-hidden rounded-2xl border border-black/20 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all ease-out ${
                isOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`}
            >
              {items.map((item, i) => (
                <button
                  key={item}
                  role="option"
                  aria-selected={false}
                  onClick={() => setOpenTab(null)}
                  className={`block w-full whitespace-nowrap px-4 py-2.5 text-center text-[13px] font-medium text-black transition-colors hover:bg-white/60 md:text-[15px] ${
                    i !== 0 ? "border-t border-black/10" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
