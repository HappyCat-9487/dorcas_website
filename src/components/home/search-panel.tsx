export function SearchPanel() {
  return (
    <aside className="w-full max-w-[378px] rounded-[30px] bg-[#d9d9d9] px-6 py-5 shadow-md">
      <h3 className="text-[30px] leading-tight tracking-tight">行程搜尋</h3>

      <div className="mt-4 space-y-5">
        <div>
          <p className="flex items-center gap-2 text-[28px] leading-tight">
            <span className="text-rose-500">▶</span>
            出發日期 | 返回日期
          </p>
          <div className="mt-2 flex gap-3">
            <div className="h-[30px] flex-1 rounded-full bg-white" />
            <div className="h-[30px] flex-1 rounded-full bg-white" />
          </div>
        </div>

        <div>
          <p className="flex items-center gap-2 text-[28px] leading-tight">
            <span className="text-rose-500">▶</span>
            目的地
          </p>
          <div className="mt-2 flex h-[30px] items-center justify-between rounded-full bg-white px-4 text-sm text-zinc-500">
            <span>請選擇區域 / 地區</span>
            <span className="text-xs">▼</span>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-2 text-[28px] leading-tight">
            <span className="text-rose-500">▶</span>
            關鍵字
          </p>
          <div className="mt-2 h-[30px] rounded-full bg-white" />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button className="rounded-full border border-black bg-[#d26a6a] px-4 py-0.5 text-[24px] leading-tight shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          搜尋
        </button>
      </div>
    </aside>
  );
}
