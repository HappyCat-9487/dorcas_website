import { PageShell } from "@/components/nav/page-shell";
import { TourDetailClient } from "@/components/tours/tour-detail-client";
import { supabaseAnon } from "@/lib/supabase/server";
import { tourDetails } from "@/components/tours/data";

// Always re-read from Supabase so cover images / stops edited in admin
// show up immediately without waiting for a rebuild.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

export default async function TourDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  // Next.js 15 already decodes the segment, but do one guarded decode in case
  // a client sent a pre-encoded value manually.
  let slug = rawSlug;
  try {
    const decoded = decodeURIComponent(rawSlug);
    if (decoded !== rawSlug) slug = decoded;
  } catch {
    // rawSlug wasn't URL-encoded; keep as is.
  }

  const sb = supabaseAnon();

  const { data: tour, error: tourError } = await sb
    .from("tours")
    .select("id, title, summary, price_from, start_date, end_date, slug")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  // Fall back to static data if not yet in Supabase
  if (!tour) {
    const staticTour = tourDetails[slug];
    if (staticTour) {
      return (
        <PageShell>
          <TourDetailClient
            title={staticTour.title}
            summary={null}
            priceFrom={null}
            startDate={null}
            endDate={null}
            heroImage={staticTour.heroImage}
            stops={staticTour.stops.map((s, i) => ({
              subtheme: s.name,
              introduction: s.description,
              image_path: s.imageUrl,
              icon_path: null,
              sort_order: i,
            }))}
            departures={staticTour.departures}
          />
        </PageShell>
      );
    }

    // Diagnostic page: makes the failure mode visible instead of silent 404,
    // so admins can quickly spot slug/RLS/publish problems.
    return (
      <PageShell>
        <main className="mx-auto max-w-[900px] space-y-4 px-6 py-14 text-black">
          <h1 className="text-2xl font-bold">找不到這個行程</h1>
          <p>
            我們試著用下面這個 <code>slug</code> 去 Supabase 找「已發佈」的行程，
            但是沒有拿到結果：
          </p>
          <pre className="overflow-x-auto rounded bg-black/5 p-3 text-sm">
            {JSON.stringify({ rawSlug, slug, tourError }, null, 2)}
          </pre>
          <p className="text-sm text-black/60">
            可能原因：slug 對不起來、tour 的 status 不是 <code>published</code>、
            或是 <code>tours</code> 的 RLS 沒允許公開讀。請到 Supabase Table
            Editor 檢查 <code>tours.slug</code> 的精確值。
          </p>
        </main>
      </PageShell>
    );
  }

  const [{ data: stops }, { data: coverImg }] = await Promise.all([
    sb
      .from("tour_stops")
      .select("subtheme, introduction, image_path, icon_path, sort_order")
      .eq("tour_id", tour.id)
      .order("sort_order"),
    sb
      .from("tour_images")
      .select("path")
      .eq("tour_id", tour.id)
      .eq("is_cover", true)
      .maybeSingle(),
  ]);

  const staticFallback = tourDetails[slug];
  const departures = staticFallback?.departures ?? [];

  return (
    <PageShell>
      <TourDetailClient
        title={tour.title}
        summary={tour.summary ?? null}
        priceFrom={tour.price_from ?? null}
        startDate={tour.start_date ?? null}
        endDate={tour.end_date ?? null}
        heroImage={coverImg?.path ?? null}
        stops={stops ?? []}
        departures={departures}
      />
    </PageShell>
  );
}
