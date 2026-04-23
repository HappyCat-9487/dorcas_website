import { PageShell } from "@/components/nav/page-shell";
import { TourDetailClient } from "@/components/tours/tour-detail-client";
import type { DepartureRow } from "@/components/tours/data";
import { supabaseAnon } from "@/lib/supabase/server";
import { tourDetails } from "@/components/tours/data";
import { computeTripDays } from "@/lib/tour-dates";

// Always re-read from Supabase so cover images / stops edited in admin
// show up immediately without waiting for a rebuild.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

function formatPrice(raw: string | null): string | null {
  if (!raw) return null;
  const n = Number(raw);
  if (isNaN(n)) return raw;
  return "NT$ " + n.toLocaleString("zh-TW");
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00Z");
  if (isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}/${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function formatTravelDate(
  start: string | null,
  end: string | null,
): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s} – ${e}`;
  return s ?? e ?? "—";
}

export default async function TourDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
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
    .select(
      "id, title, summary, price_from, airline, visa, start_date, end_date, slug",
    )
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

  // Build the single departure row from this tour's own fields. (Capacity /
  // "額滿" support is reserved for future capacity tracking.)
  const row: DepartureRow = {
    travelDate: formatTravelDate(tour.start_date ?? null, tour.end_date ?? null),
    tourName: tour.title,
    days: computeTripDays(tour.start_date, tour.end_date),
    airline: tour.airline ?? null,
    visa: tour.visa ?? null,
    pricePerPerson: formatPrice(tour.price_from ?? null),
    status: "open",
  };
  const hasAnyDepartureInfo =
    tour.start_date || tour.end_date || tour.price_from || tour.airline || tour.visa;

  return (
    <PageShell>
      <TourDetailClient
        title={tour.title}
        summary={tour.summary ?? null}
        heroImage={coverImg?.path ?? null}
        stops={stops ?? []}
        departures={hasAnyDepartureInfo ? [row] : []}
      />
    </PageShell>
  );
}
