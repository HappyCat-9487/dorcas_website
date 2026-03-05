import { regionTabs } from "@/src/components/home/constants";

export function RegionTabs() {
  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
      {regionTabs.map((tab) => (
        <button
          key={tab}
          className="h-[46px] min-w-[84px] rounded-2xl border-2 border-black bg-[#d9d9d9] px-4 text-xs font-semibold text-[#ef941b] shadow-[0_3px_4px_rgba(0,0,0,0.25)] transition hover:bg-neutral-100 md:h-[52px] md:min-w-[102px] md:text-sm"
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
