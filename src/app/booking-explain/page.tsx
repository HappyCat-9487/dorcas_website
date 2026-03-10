import { PageShell } from "@/components/nav/page-shell";

const HERO_IMAGE =
  "https://www.figma.com/api/mcp/asset/fd02678e-1a38-4955-bb67-92519295b995";

const rules = [
  "訂位時輸入之英文姓名必須與護照上英文姓名相同，只需輸入英文字母及可（，及-）不需輸入！若姓名輸入錯誤，必須取消原訂位，紀錄重新定位，若因此造成旅客無法成行，本公司恕不負責（航空公司不接受姓名更改，即使開票亦無法登機）。",
  "在訂票成功後，請盡速完成付款開票，若沒能立即完成，所定的機位依照各航空公司之規定將無法保留過久。",
  "開票期限內如遇票價及稅金調漲則須以成交當時票價及稅金為準！本公司不再另行通知！！如行程確定請儘早開票以免票價變動！！",
  "依航空公司規定，消費者於同一家航空公司不得有兩個（或以上）之訂位紀錄（同一旅客訂購同一家航空公司之相關航班日期者是為重複訂位），如因重複定位被航空公司取消機位所造成之損失，本公司恕不負責。",
];

export default function BookingExplainPage() {
  return (
    <PageShell>
      {/* ── Hero image ─────────────────────────────────────────── */}
      <div className="h-[280px] w-full overflow-hidden md:h-[499px]">
        <img
          src={HERO_IMAGE}
          alt="中正紀念堂"
          className="h-full w-full object-cover"
        />
      </div>

      {/* ── Content area ───────────────────────────────────────── */}
      <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
        {/* Title row */}
        <div className="flex flex-wrap items-baseline gap-3 border-b-2 border-black pb-4">
          <h1 className="font-mono text-[32px] font-semibold md:text-[40px]">
            訂票服務
          </h1>
          <span className="font-['Rouge_Script',cursive] text-[32px] italic md:text-[44px]">
            Travel Service
          </span>
        </div>

        {/* Intro */}
        <p className="mt-6 text-[18px] leading-relaxed md:text-[20px]">
          本公司提供各大航空公司之機票訂票服務，如您有任何需求請歡迎來電洽詢，相關訂票服務規定如下
        </p>

        {/* Numbered rules */}
        <ol className="mt-6 space-y-5">
          {rules.map((rule, i) => (
            <li key={i} className="flex gap-3 text-[17px] leading-relaxed md:text-[19px]">
              <span className="mt-0.5 shrink-0 font-semibold">{i + 1}.</span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>
      </div>
    </PageShell>
  );
}
