import { tripFeatures, type TripFeature } from "@/components/home/constants";
import { HomeHero } from "@/components/home/home-hero";
import { TripFeatureRow } from "@/components/home/trip-feature-row";
import { supabaseAnon } from "@/lib/supabase/server";

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

  const featured = rows
    .filter((r) => r.featured_on_home)
    .sort(byUpcomingStart);

  const rest = rows
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
  const dbFeatures = await loadHomeFeatures();

  // When the admin hasn't published anything yet, keep the old placeholder look
  // so the homepage doesn't render empty.
  const features = dbFeatures.length > 0 ? dbFeatures : tripFeatures;

  return (
    <main className="bg-[#f5ca91] text-black">
      <HomeHero />

      <section className="mx-auto max-w-[1440px] space-y-10 px-4 pb-14 md:space-y-14 md:px-10 md:pb-20">
        {features.map((feature, i) => (
          <TripFeatureRow key={`${feature.title}-${i}`} {...feature} />
        ))}
      </section>
    </main>
  );
}
