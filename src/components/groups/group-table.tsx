import Link from "next/link";
import type { GroupTour } from "@/components/groups/constants";

const columns = ["旅行日期", "行程名稱", "天數", "航空公司", "簽證", "價格/人", "報名狀態"];

function StatusBadge({ status }: { status: GroupTour["status"] }) {
  const isFull = status === "額滿";
  return (
    <span
      className={`inline-block min-w-[60px] rounded-full px-4 py-1.5 text-center text-[15px] font-semibold text-white ${
        isFull ? "bg-[#e07070]" : "bg-[#2dc8a8]"
      }`}
    >
      {status}
    </span>
  );
}

export function GroupTable({ rows }: { rows: GroupTour[] }) {
  return (
    <div className="mx-auto max-w-[1320px] px-5 pb-14 pt-0 md:px-10">
      {/* Header row */}
      <div className="mb-1 grid grid-cols-[1.4fr_2fr_0.7fr_1.2fr_0.7fr_1.3fr_1fr] rounded-2xl bg-[#b8967a] px-6 py-4 text-center text-[15px] font-semibold text-[#f5e8d8] md:text-[17px]">
        {columns.map((col) => (
          <span key={col}>{col}</span>
        ))}
      </div>

      {/* Data rows */}
      {rows.length === 0 ? (
        <div className="px-6 py-10 text-center text-black/50">
          目前尚無已發佈且設定旅行日期的行程。
        </div>
      ) : (
        <div className="divide-y divide-[#c9a87c]">
          {rows.map((tour, i) => {
            const inner = (
              <>
                <span className="italic text-[#5a3e28]">{tour.date}</span>
                <span className="font-medium">{tour.tripName}</span>
                <span>{tour.days ?? "—"}</span>
                <span>{tour.airline ?? "—"}</span>
                <span>{tour.visa ?? "—"}</span>
                <span className="font-medium">{tour.price ?? "—"}</span>
                <span className="flex justify-center">
                  <StatusBadge status={tour.status} />
                </span>
              </>
            );

            const rowCls =
              "grid grid-cols-[1.4fr_2fr_0.7fr_1.2fr_0.7fr_1.3fr_1fr] items-center px-6 py-5 text-center text-[15px] md:text-[17px]";

            return tour.href ? (
              <Link
                key={i}
                href={tour.href}
                className={`${rowCls} transition-colors hover:bg-[#f5ca91]/40`}
              >
                {inner}
              </Link>
            ) : (
              <div key={i} className={rowCls}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
