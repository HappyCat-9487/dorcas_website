import { cn } from "@/lib/utils";
import type { TripFeature } from "@/src/components/home/constants";
import styles from "@/src/components/home/homepage.module.css";

export function TripFeatureRow({
  title,
  imageUrl,
  reverse = false,
  imageHeightClass,
  detailHeightClass,
}: TripFeature) {
  return (
    <article className="grid items-start gap-8 md:grid-cols-2">
      <img
        src={imageUrl}
        alt={title}
        className={cn(
          "w-full rounded-[30px] object-cover",
          imageHeightClass ?? "h-[300px] md:h-[390px]",
          reverse && "md:order-2",
        )}
      />
      <div className={cn(reverse && "md:order-1")}>
        <h3 className="border-b border-black pb-1 text-[40px] leading-tight">{title}</h3>
        <div
          className={cn(
            `mt-3 flex items-center justify-center bg-[#88786b] px-8 text-center text-[48px] leading-tight text-white ${styles.detailBox}`,
            detailHeightClass ?? "h-[320px]",
          )}
        >
          細節填寫區
        </div>
        <p className="mt-2 text-right text-[20px]">按此了解更多</p>
      </div>
    </article>
  );
}
