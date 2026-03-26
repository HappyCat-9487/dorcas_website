import Link from "next/link";
import { cn } from "@/lib/utils";

export type TourCardProps = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  /** ISO date strings from DB */
  startDate?: string | null;
  endDate?: string | null;
  /** Static departure date badges (fallback when no DB dates) */
  departureDates?: string[];
  /** Raw number string from DB, e.g. "179000" */
  priceFrom?: string | null;
  /** Static price fallback text */
  price?: string;
  learnMoreHref?: string;
  reverse?: boolean;
};

function formatPrice(raw?: string | null): string | null {
  if (!raw) return null;
  const n = Number(raw);
  if (isNaN(n)) return raw;
  return "NT$ " + n.toLocaleString("zh-TW");
}

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function TourCard({
  title,
  description,
  imageUrl,
  startDate,
  endDate,
  departureDates,
  priceFrom,
  price,
  learnMoreHref = "#",
  reverse = false,
}: TourCardProps) {
  const displayPrice = formatPrice(priceFrom) ?? price ?? "";

  const formattedStart = formatDate(startDate);
  const formattedEnd   = formatDate(endDate);
  const dateRange = formattedStart && formattedEnd
    ? `${formattedStart} – ${formattedEnd}`
    : formattedStart ?? formattedEnd ?? null;

  return (
    <article className="grid items-start gap-5 md:grid-cols-2 md:gap-8">

      {/* ── Image ──────────────────────────────────────────────────── */}
      <img
        src={imageUrl}
        alt={title}
        className={cn(
          "h-[260px] w-full rounded-[30px] object-cover md:h-[400px]",
          reverse && "md:order-2",
        )}
      />

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className={cn("flex flex-col", reverse && "md:order-1")}>

        <h2
          className={cn(
            "border-b border-black pb-3 text-[26px] font-semibold leading-tight md:text-[34px]",
            reverse ? "text-left" : "text-right",
          )}
        >
          {title}
        </h2>

        <p className="mt-3 text-[13px] leading-relaxed text-black/60 md:text-[15px]">
          {description}
        </p>

        {/* Date range (DB) or departure date badges (static) */}
        <div className="mt-4">
          {dateRange ? (
            <p className="text-[14px] font-medium text-black/70 md:text-[16px]">
              📅 {dateRange}
            </p>
          ) : departureDates && departureDates.length > 0 ? (
            <>
              <p className="mb-2 text-[14px] font-semibold md:text-[16px]">團體：</p>
              <div className="grid grid-cols-2 gap-2">
                {departureDates.map((date) => (
                  <span
                    key={date}
                    className="rounded-full bg-[#e8928a] px-3 py-2 text-center text-[13px] font-medium text-white md:text-[14px]"
                  >
                    {date}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Price */}
        {displayPrice && (
          <div className="mt-5 rounded-2xl border border-black/20 bg-white/30 px-4 py-3">
            <p className="text-[20px] font-bold md:text-[26px]">
              {displayPrice}{" "}
              <span className="text-[14px] font-normal text-black/70 md:text-[16px]">
                起/人
              </span>
            </p>
            <div className="mt-1 text-right">
              <Link
                href={learnMoreHref}
                className="text-[13px] text-black/50 hover:text-black hover:underline md:text-[15px]"
              >
                按此了解更多
              </Link>
            </div>
          </div>
        )}

      </div>
    </article>
  );
}
