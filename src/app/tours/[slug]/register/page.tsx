import Link from "next/link";
import { PageShell } from "@/components/nav/page-shell";
import { RegistrationForm } from "@/components/tours/registration-form";
import { supabaseAnon } from "@/lib/supabase/server";
import {
    computeRegistrationStatus,
    getSignedUpCount,
} from "@/lib/registration-status";

// Always check capacity fresh: if someone else just took the last seat, we
// want this page to immediately show the "額滿" state rather than serve a
// cached "open" copy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

export default async function TourRegisterPage({ params }: Props) {
    const { slug: rawSlug } = await params;
    let slug = rawSlug;
    try {
        const decoded = decodeURIComponent(rawSlug);
        if (decoded !== rawSlug) slug = decoded;
    } catch {
        // rawSlug wasn't URL-encoded; keep as is.
    }

    const sb = supabaseAnon();
    const { data: tour } = await sb
        .from("tours")
        .select("id, title, slug, max_attendees, start_date, end_date")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

    if (!tour) {
        return (
            <PageShell>
                <main className="mx-auto max-w-[900px] px-6 py-14">
                    <h1 className="text-2xl font-bold text-[#5a3e28]">找不到這個行程</h1>
                    <p className="mt-3 text-black/60">行程可能已下架，請回到首頁重新選擇。</p>
                    <Link href="/" className="mt-6 inline-block text-[#e8928a] underline">回首頁</Link>
                </main>
            </PageShell>
        );
    }

    const signedUp = await getSignedUpCount(tour.id);
    const status = computeRegistrationStatus(tour.max_attendees, signedUp);
    const seatsLeft =
        tour.max_attendees !== null && tour.max_attendees !== undefined
            ? Math.max(0, tour.max_attendees - signedUp)
            : null;

    return (
        <PageShell>
            <main className="mx-auto max-w-[860px] px-5 py-10 md:px-8 md:py-14">
                <Link
                    href={`/tours/${encodeURIComponent(tour.slug)}`}
                    className="text-sm text-[#7a4020]/70 hover:text-[#7a4020] hover:underline md:text-base"
                >
                    ← 回行程
                </Link>

                <h1 className="mt-3 text-[28px] font-bold text-[#5a3e28] md:text-[36px]">
                    線上報名
                </h1>
                <p className="mt-2 text-[15px] text-black/60 md:text-base">
                    行程：<span className="font-medium text-[#7a4020]">{tour.title}</span>
                </p>
                {seatsLeft !== null && (
                    <p className="mt-1 text-[14px] text-black/50">
                        剩餘名額：<span className="font-semibold text-[#7a4020]">{seatsLeft} 位</span>
                        （上限 {tour.max_attendees}）
                    </p>
                )}

                <div className="mt-8">
                    {status === "full" ? (
                        <div className="rounded-2xl border border-[#e07070]/30 bg-[#fbe9e9] p-8 text-center">
                            <h2 className="text-[22px] font-semibold text-[#b04545] md:text-[26px]">
                                此團名額已額滿
                            </h2>
                            <p className="mt-3 text-[15px] text-black/70">
                                我們將盡速規劃下一梯次，歡迎透過
                                <Link
                                    href={`/tours/${encodeURIComponent(tour.slug)}`}
                                    className="mx-1 underline hover:text-[#e8928a]"
                                >
                                    行程諮詢
                                </Link>
                                留下聯絡方式，業務會主動通知您。
                            </p>
                        </div>
                    ) : (
                        <RegistrationForm
                            tourId={tour.id}
                            tourTitle={tour.title}
                            seatsLeft={seatsLeft}
                        />
                    )}
                </div>
            </main>
        </PageShell>
    );
}
