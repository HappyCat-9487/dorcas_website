import { PageShell } from "@/components/nav/page-shell";

export const metadata = {
    title: "隱私權政策 — 多加旅行社",
};

export default function PrivacyPage() {
    return (
        <PageShell>
            <main className="mx-auto max-w-[860px] px-5 py-12 md:px-8 md:py-16">
                <h1 className="text-[28px] font-bold text-[#5a3e28] md:text-[36px]">
                    隱私權政策
                </h1>
                <p className="mt-2 text-sm text-[#7a4020]/60">
                    Privacy Policy — Dorcas Travel Service Co., Ltd.
                </p>

                <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-[#5a3e28]/80 md:text-base">
                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-[#7a4020]">一、蒐集之個人資料</h2>
                        <p>
                            本公司因旅遊服務需要，可能蒐集您的以下個人資料：姓名、性別、出生日期、身分證字號、護照號碼及效期、聯絡電話、電子郵件、通訊地址、緊急聯絡人資訊，以及其他辦理出入境與旅遊保險所需之相關資料。
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-[#7a4020]">二、蒐集目的與利用範圍</h2>
                        <p>上述個人資料僅限用於以下目的：</p>
                        <ul className="mt-2 list-disc space-y-1 pl-6">
                            <li>旅遊行程報名、機票與住宿預訂</li>
                            <li>出入境手續辦理（機票、簽證、保險等）</li>
                            <li>緊急狀況聯繫</li>
                            <li>客服回覆與行程通知</li>
                            <li>經您同意之行銷活動通知</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-[#7a4020]">三、資料共享對象</h2>
                        <p>本公司可能將您的個人資料提供予下列第三方，僅限履行旅遊服務之必要範圍：</p>
                        <ul className="mt-2 list-disc space-y-1 pl-6">
                            <li>合作航空公司、飯店、當地地接社</li>
                            <li>簽證辦理機構</li>
                            <li>旅遊保險公司</li>
                            <li>網站託管服務（Vercel, Supabase）</li>
                            <li>通訊服務（LINE）</li>
                            <li>AI 諮詢功能（OpenAI）— 僅處理您在聊天中主動輸入的內容，不會傳送您的報名個資</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-[#7a4020]">四、資料保護措施</h2>
                        <p>
                            本公司採用加密傳輸（HTTPS）、資料庫存取控制（Row Level Security）及最小權限原則等技術措施保護您的個人資料，防止未經授權之存取、使用或洩露。
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-[#7a4020]">五、資料保存期間</h2>
                        <p>
                            您的報名資料將於行程結束後保存必要之期間（通常不超過一年），以利後續客服、退費或保險理賠處理。逾期後將主動刪除或去識別化處理。
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-[#7a4020]">六、您的權利</h2>
                        <p>依據《個人資料保護法》，您有權：</p>
                        <ul className="mt-2 list-disc space-y-1 pl-6">
                            <li>查詢或閱覽您的個人資料</li>
                            <li>請求製給複本</li>
                            <li>請求補充或更正</li>
                            <li>請求停止蒐集、處理或利用</li>
                            <li>請求刪除</li>
                        </ul>
                        <p className="mt-2">
                            如需行使上述權利，請聯絡我們：
                            <a
                                href="mailto:jean08361@dorcas-ts.com.tw"
                                className="ml-1 text-[#b83553] underline-offset-4 hover:underline"
                            >
                                jean08361@dorcas-ts.com.tw
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-[#7a4020]">七、Cookie 與網站分析</h2>
                        <p>
                            本網站可能使用 Cookie 及類似技術以改善使用體驗。這些資料不會用於識別您的個人身分。
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-[#7a4020]">八、隱私權政策之修訂</h2>
                        <p>
                            本公司保留隨時修訂本隱私權政策之權利。修訂後將於本頁面公告，不另行個別通知。
                        </p>
                    </section>

                    <div className="mt-10 rounded-xl border border-[#e8c9a0] bg-[#fdf7ee] px-5 py-4 text-sm text-[#7a4020]/70">
                        <p>
                            <strong>多加旅行社有限公司</strong>
                            <br />
                            地址：台北市中山區長安東路一段 13 號 8 樓
                            <br />
                            客服信箱：
                            <a href="mailto:jean08361@dorcas-ts.com.tw" className="underline">
                                jean08361@dorcas-ts.com.tw
                            </a>
                            <br />
                            電話：02-25311110
                        </p>
                        <p className="mt-2 text-xs text-[#7a4020]/40">
                            本政策最後更新日期：2026 年 7 月
                        </p>
                    </div>
                </div>
            </main>
        </PageShell>
    );
}
