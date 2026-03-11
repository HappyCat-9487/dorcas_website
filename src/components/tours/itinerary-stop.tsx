import { cn } from "@/lib/utils";
import type { ItineraryStop } from "@/components/tours/data";

export function ItineraryStopCard({
  name,
  description,
  imageUrl,
  reverse = false,
}: ItineraryStop) {
  return (
    <article className="overflow-hidden rounded-[32px] bg-[#f5ca91] p-5 md:p-8">
      <div className="grid items-start gap-5 md:grid-cols-2 md:gap-8">

        {/* ── Image with floating outer frame ─────────────────────────── */}
        <div
          className={cn(
            "overflow-hidden rounded-[20px] border-[3px] border-[#c0445c] shadow-[4px_4px_0px_#c0445c]",
            reverse && "md:order-2",
          )}
        >
          <img
            src={imageUrl}
            alt={name}
            className="h-[280px] w-full object-cover md:h-[460px]"
          />
        </div>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className={cn("flex flex-col", reverse && "md:order-1")}>

          {/* Location badge — mirrors direction based on reverse */}
          <div className={cn("flex items-center", reverse ? "justify-start" : "justify-end")}>
            {reverse ? (
              /* reverse: pill LEFT, coin RIGHT */
              <div className="relative flex items-center">
                <div className="-mr-3 rounded-l-full bg-[#e8928a] py-2 pl-5 pr-6 shadow-sm">
                  <span className="whitespace-nowrap text-[26px] font-semibold text-white md:text-[40px]">
                    {name}
                  </span>
                </div>
                <div className="relative z-10 flex size-[56px] shrink-0 items-center justify-center rounded-full border-4 border-[#f5ca91] bg-[#e8928a] shadow-md">
                  <img src="/icons/coin.png" alt="location" className="size-8 object-contain" />
                </div>
              </div>
            ) : (
              /* normal: coin LEFT, pill RIGHT */
              <div className="relative flex items-center">
                <div className="relative z-10 flex size-[56px] shrink-0 items-center justify-center rounded-full border-4 border-[#f5ca91] bg-[#e8928a] shadow-md">
                  <img src="/icons/coin.png" alt="location" className="size-8 object-contain" />
                </div>
                <div className="-ml-3 rounded-r-full bg-[#e8928a] py-2 pl-6 pr-5 shadow-sm">
                  <span className="whitespace-nowrap text-[26px] font-semibold text-white md:text-[40px]">
                    {name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description — crimson, underlined, alignment mirrors image side */}
          <p className={cn(
            "mt-6 text-[20px] leading-[1.9] text-[#b83553] underline md:text-[30px]",
            reverse ? "text-left" : "text-right",
          )}>
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}
