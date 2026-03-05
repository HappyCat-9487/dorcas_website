export function SearchPanel() {
  return (
    <aside className="w-full max-w-[340px] rounded-[24px] bg-[#d9d9d9] px-4 py-4 shadow-md md:max-w-[350px] md:rounded-[30px] md:px-6 md:py-5 xl:max-w-[378px]">
      <h3 className="text-[24px] leading-tight tracking-tight md:text-[30px]">行程搜尋</h3>

      <div className="mt-3 space-y-4 md:mt-4 md:space-y-5">
        <div>
          <p className="flex items-center gap-1.5 text-[20px] leading-tight md:gap-2 md:text-[28px]">
            <span className="text-rose-500">▶</span>
            出發日期 | 返回日期
          </p>
          <div className="mt-1.5 flex gap-2 md:mt-2 md:gap-3">
            <div className="h-[24px] flex-1 rounded-full bg-white md:h-[30px]" />
            <div className="h-[24px] flex-1 rounded-full bg-white md:h-[30px]" />
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[20px] leading-tight md:gap-2 md:text-[28px]">
            <span className="text-rose-500">▶</span>
            目的地
          </p>
          <div className="mt-1.5 flex h-[24px] items-center justify-between rounded-full bg-white px-3 text-xs text-zinc-500 md:mt-2 md:h-[30px] md:px-4 md:text-sm">
            <span>請選擇區域 / 地區</span>
            <span className="text-xs">▼</span>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[20px] leading-tight md:gap-2 md:text-[28px]">
            <span className="text-rose-500">▶</span>
            關鍵字
          </p>
          <div className="mt-1.5 h-[24px] rounded-full bg-white md:mt-2 md:h-[30px]" />
        </div>
      </div>

      <div className="mt-3 flex justify-end md:mt-4">
        <button className="rounded-full border border-black bg-[#d26a6a] px-3 py-0.5 text-[20px] leading-tight shadow-[0_2px_4px_rgba(0,0,0,0.25)] md:px-4 md:text-[24px]">
          搜尋
        </button>
      </div>
    </aside>
  );
}
