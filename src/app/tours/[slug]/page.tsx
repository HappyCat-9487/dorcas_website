import { notFound } from "next/navigation";
import { PageShell } from "@/components/nav/page-shell";
import { TourDetailClient } from "@/components/tours/tour-detail-client";
import { supabaseAnon } from "@/lib/supabase/server";
import { tourDetails } from "@/components/tours/data";

type Props = { params: Promise<{ slug: string }> };

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params;

  const sb = supabaseAnon();

  const { data: tour } = await sb
    .from("tours")
    .select("id, title, summary, price_from, start_date, end_date, slug")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  // Fall back to static data if not yet in Supabase
  if (!tour) {
    const staticTour = tourDetails[slug];
    if (!staticTour) notFound();

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
