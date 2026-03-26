import { notFound } from "next/navigation";
import { Italianno } from "next/font/google";
import { PageShell } from "@/components/nav/page-shell";
import { TourCard, type TourCardProps } from "@/components/destinations/tour-card";
import { destinationPages } from "@/components/destinations/data";
import { supabaseAnon } from "@/lib/supabase/server";

const italianno = Italianno({ subsets: ["latin"], weight: "400" });

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return Object.keys(destinationPages).map((slug) => ({ slug }));
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const data = destinationPages[slug];

  if (!data) notFound();

  // Try to load live published tours for this destination region from Supabase.
  // Tours are linked to categories; find the category whose slug matches this page slug.
  const sb = supabaseAnon();

  const { data: category } = await sb
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  let liveTours: TourCardProps[] = [];

  if (category) {
    // Fetch published tours in this category with their cover images
    const { data: rows } = await sb
      .from("tour_categories")
      .select(`
        tours (
          id,
          title,
          summary,
          slug,
          price_from,
          start_date,
          end_date,
          tour_images ( path, is_cover )
        )
      `)
      .eq("category_id", category.id);

    if (rows) {
      type TourRow = {
        id: string;
        title: string;
        summary: string | null;
        slug: string;
        price_from: string | null;
        start_date: string | null;
        end_date: string | null;
        tour_images: { path: string; is_cover: boolean }[];
      };

      liveTours = rows.flatMap((row, i) => {
        const raw = row.tours as unknown;
        const t: TourRow | null = Array.isArray(raw) ? (raw[0] ?? null) : (raw as TourRow | null);

        if (!t) return [];

        const cover = (t.tour_images ?? []).find((img) => img.is_cover);

        return [{
          id: t.id,
          title: t.title,
          description: t.summary ?? "",
          imageUrl: cover?.path ?? "/figures/NorwayAurora.jpg",
          startDate: t.start_date,
          endDate: t.end_date,
          priceFrom: t.price_from,
          learnMoreHref: `/tours/${t.slug}`,
          reverse: i % 2 === 1,
        }];
      });
    }
  }

  // Merge: live tours take precedence; static tours fill in gaps
  const liveIds = new Set(
    liveTours.map((t) => t.learnMoreHref?.replace("/tours/", "") ?? ""),
  );
  const staticTours: TourCardProps[] = data.tours
    .filter((t) => !liveIds.has(t.id))
    .map((t) => ({
      ...t,
      priceFrom: null,
      startDate: null,
      endDate: null,
    }));

  const allTours = [...liveTours, ...staticTours];

  return (
    <PageShell>
      {/* ── Hero photo + wave ─────────────────────────────────────── */}
      <div className="relative h-[300px] overflow-hidden md:h-[460px]">
        <img
          src={data.heroImage}
          alt={data.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/25" />

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            className="block h-[70px] w-full md:h-[110px]"
            aria-hidden="true"
          >
            <path
              d="M0,60 C200,10 480,90 720,40 C960,0 1220,80 1440,35 L1440,100 L0,100 Z"
              fill="#f5ca91"
            />
          </svg>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-4 md:px-10 md:pb-24 md:pt-8">

        <h1 className="mb-10 leading-snug md:mb-14">
          <span className={`${italianno.className} text-[48px] md:text-[60px]`}>
            Rejseplan?
          </span>
          <span className="ml-2 text-[22px] md:text-[28px]">行程列表？</span>
        </h1>

        {allTours.length > 0 ? (
          <div className="space-y-14 md:space-y-24">
            {allTours.map((tour) => (
              <TourCard key={tour.id} {...tour} />
            ))}
          </div>
        ) : (
          <p className="text-center text-[18px] text-black/50 md:text-[22px]">
            行程資料整理中，敬請期待。
          </p>
        )}
      </div>
    </PageShell>
  );
}
