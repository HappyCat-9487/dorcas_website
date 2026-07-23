import Link from "next/link";
import { type TripFeature } from "@/components/home/constants";
import { HomeHero } from "@/components/home/home-hero";
import { NewsSection } from "@/components/home/news-section";
import { TripFeatureRow } from "@/components/home/trip-feature-row";
import { getHomepageNews } from "@/lib/news";
import { supabaseAnon } from "@/lib/supabase/server";
import { todayISODateInTimeZone, TOUR_DATE_TZ } from "@/lib/tour-dates";

const HOME_FEATURE_COUNT = 3;

type HomeTourRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  start_date: string | null;
  updated_at: string;
  featured_on_home: boolean;
  tour_images: { path: string; is_cover: boolean }[] | null;
};

/** A tour is "expired" once its start_date has passed (Taiwan timezone). */
function isExpired(row: HomeTourRow, today: string): boolean {
  return !!row.start_date && row.start_date < today;
}

/** Sort: soonest upcoming start_date first, NULL start_date last, tie-break by updated_at desc. */
function byUpcomingStart(a: HomeTourRow, b: HomeTourRow): number {
  const aHas = !!a.start_date;
  const bHas = !!b.start_date;
  if (aHas && bHas) {
    const cmp = a.start_date!.localeCompare(b.start_date!);
    if (cmp !== 0) return cmp;
  } else if (aHas !== bHas) {
    return aHas ? -1 : 1;
  }
  return b.updated_at.localeCompare(a.updated_at);
}

async function loadHomeFeatures(): Promise<TripFeature[]> {
  const sb = supabaseAnon();

  const { data } = await sb
    .from("tours")
    .select(
      "id, title, slug, summary, start_date, updated_at, featured_on_home, tour_images(path, is_cover)",
    )
    .eq("status", "published");

  const rows = (data ?? []) as HomeTourRow[];
  if (rows.length === 0) return [];

  // Hide tours whose start date has already passed — they shouldn't be
  // promoted on the home page even if the admin still has them "featured".
  const today = todayISODateInTimeZone(TOUR_DATE_TZ);
  const upcoming = rows.filter((r) => !isExpired(r, today));

  const featured = upcoming
    .filter((r) => r.featured_on_home)
    .sort(byUpcomingStart);

  const rest = upcoming
    .filter((r) => !r.featured_on_home)
    .sort(byUpcomingStart);

  const chosen = [...featured, ...rest].slice(0, HOME_FEATURE_COUNT);

  return chosen.map<TripFeature>((t, i) => {
    const cover = (t.tour_images ?? []).find((img) => img.is_cover);
    return {
      title: t.title,
      imageUrl: cover?.path ?? "/figures/NorwayAurora.jpg",
      summary: t.summary ?? undefined,
      href: `/tours/${encodeURIComponent(t.slug)}`,
      reverse: i % 2 === 1,
    };
  });
}

export async function Homepage() {
  // Fetch both concurrently — the news section query is small and indexed,
  // so the homepage's TTFB stays the same.
  const [dbFeatures, news] = await Promise.all([
    loadHomeFeatures(),
    getHomepageNews(),
  ]);

  return (
    <main className="bg-[#f5ca91] text-black">
      <HomeHero />

      <NewsSection items={news} />

      <section className="mx-auto max-w-[1440px] space-y-10 px-4 pb-14 md:space-y-14 md:px-10 md:pb-20 pt-10 md:pt-14">
        {dbFeatures.length > 0 ? (
          dbFeatures.map((feature, i) => (
            <TripFeatureRow key={`${feature.title}-${i}`} {...feature} />
          ))
        ) : (
          <EmptyFeatures />
        )}
      </section>
    </main>
  );
}

/**
 * Shown when there are no upcoming published tours. We intentionally do NOT
 * fall back to hardcoded placeholder tours (which would show fake trips with
 * broken images) — a clean "coming soon" state is more honest for a live site.
 */
function EmptyFeatures() {
  return (
    <div className="rounded-3xl border border-black/10 bg-[#fdf7ee] px-6 py-16 text-center">
      <p className="text-2xl font-bold text-[#7a4020] md:text-3xl">
        更多精彩行程規劃中
      </p>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#7a4020]/60">
        目前尚無即將出發的行程，我們正在籌備新的旅程。
        歡迎透過下方連結瀏覽所有團體行程，或與我們聯絡。
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/groups"
          className="rounded-full bg-[#d26a6a] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          瀏覽團體總列表
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-[#d26a6a] px-6 py-2.5 text-sm font-semibold text-[#d26a6a] transition-colors hover:bg-[#d26a6a]/10"
        >
          聯絡我們
        </Link>
      </div>
    </div>
  );
}
