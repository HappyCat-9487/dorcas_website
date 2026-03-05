import { regionTabs } from "@/src/components/home/constants";

export function RegionTabs() {
  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:justify-center md:overflow-visible md:pb-0">
      {regionTabs.map((tab) => (
        <button
          key={tab}
          className="h-[40px] min-w-[74px] shrink-0 rounded-2xl border-2 border-black bg-[#d9d9d9] px-3 text-[11px] font-semibold text-[#ef941b] shadow-[0_3px_4px_rgba(0,0,0,0.25)] transition hover:bg-neutral-100 md:h-[52px] md:min-w-[102px] md:px-4 md:text-sm"
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
