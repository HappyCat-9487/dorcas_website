import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TripFeature } from "@/components/home/constants";

export function TripFeatureRow({
  title,
  imageUrl,
  summary,
  href,
  reverse = false,
  imageHeightClass,
}: TripFeature) {
  return (
    <article className="grid items-start gap-5 md:gap-8 md:grid-cols-2">
      <img
        src={imageUrl}
        alt={title}
        className={cn(
          "w-full rounded-[30px] object-cover",
          imageHeightClass ?? "h-[300px] md:h-[390px]",
          reverse && "md:order-2",
        )}
      />

      <div
        className={cn(
          "flex h-full flex-col justify-between",
          reverse && "md:order-1",
        )}
      >
        <div>
          <h3 className="border-b border-black pb-2 text-[32px] leading-tight md:text-[40px]">
            {title}
          </h3>

          {summary ? (
            <p className="mt-4 whitespace-pre-line text-[16px] leading-relaxed text-black/75 md:mt-6 md:text-[19px]">
              {summary}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end md:mt-8">
          {href ? (
            <Link
              href={href}
              className="inline-flex items-center rounded-full border border-black/20 bg-white/40 px-5 py-2 text-[15px] font-medium text-black/80 transition-colors hover:border-black hover:bg-white hover:text-black md:text-[17px]"
            >
              按此了解更多
            </Link>
          ) : (
            <span className="text-[15px] text-black/60 md:text-[17px]">
              按此了解更多
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
