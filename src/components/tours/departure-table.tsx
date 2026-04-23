import type { DepartureRow } from "@/components/tours/data";

type Props = { rows: DepartureRow[] };

export function DepartureTable({ rows }: Props) {
  return (
    <div className="w-full bg-[#f5ca91] px-4 py-8 md:px-10 md:py-12">
      <div className="overflow-hidden rounded-2xl border border-black/10 shadow-sm">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-[1.4fr_2fr_0.6fr_1.2fr_0.7fr_1.4fr_1fr] bg-[#c8a06a] px-6 py-4 text-center text-[15px] font-semibold text-white md:text-[17px]">
          <span>旅行日期</span>
          <span>行程名稱</span>
          <span>天數</span>
          <span>航空公司</span>
          <span>簽證</span>
          <span>價格/人</span>
          <span>報名狀態</span>
        </div>

        {/* ── Rows ───────────────────────────────────────────────────── */}
        <div className="bg-[#f5ca91]">
          {rows.length > 0 ? rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1.4fr_2fr_0.6fr_1.2fr_0.7fr_1.4fr_1fr] items-center border-b border-black/10 px-6 py-5 text-center text-[15px] last:border-b-0 md:py-6 md:text-[16px]"
            >
              <span className="italic text-black/70">{row.travelDate}</span>
              <span className="text-black/80">{row.tourName}</span>
              <span className="text-black/70">{row.days ?? "—"}</span>
              <span className="text-black/70">{row.airline ?? "—"}</span>
              <span className="text-black/70">{row.visa ?? "—"}</span>
              <span className="font-medium text-black/80">{row.pricePerPerson ?? "—"}</span>
              <span className="flex justify-center">
                {row.status === "full" ? (
                  <span className="rounded-full bg-[#e8928a] px-5 py-1.5 text-[14px] font-semibold text-white">
                    額滿
                  </span>
                ) : (
                  <span className="rounded-full bg-[#5bbfa8] px-5 py-1.5 text-[14px] font-semibold text-white">
                    報名
                  </span>
                )}
              </span>
            </div>
          )) : (
            <div className="px-6 py-10 text-center text-black/50">
              尚未設定出發資訊。
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
