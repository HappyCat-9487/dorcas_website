import { notFound } from "next/navigation";
import { Italianno } from "next/font/google";
import { PageShell } from "@/components/nav/page-shell";
import { TourCard, type TourCardProps } from "@/components/destinations/tour-card";
import {
  destinations,
  destinationsBySlug,
  destinationHeroKey,
  DEFAULT_DESTINATION_HERO,
} from "@/components/destinations/constants";
import { supabaseAnon } from "@/lib/supabase/server";
import { getSettingValue } from "@/lib/site-settings";

const italianno = Italianno({ subsets: ["latin"], weight: "400" });

// Always re-read tours from Supabase on every visit so newly published /
// updated tours show up immediately without waiting for a rebuild.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return destinations.map(({ slug }) => ({ slug }));
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const info = destinationsBySlug[slug];

  if (!info) notFound();

  const sb = supabaseAnon();

  // Hero banner for this destination (admin-configurable); fallback to default image.
  const heroImage =
    (await getSettingValue(destinationHeroKey(slug))) ?? DEFAULT_DESTINATION_HERO;

  // Look up the category row with this slug so we can find tours linked to it.
  const { data: category } = await sb
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  let tours: TourCardProps[] = [];

  if (category) {
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
          status,
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
        status: string;
        tour_images: { path: string; is_cover: boolean }[];
      };

      tours = rows
        .flatMap((row, i) => {
          const raw = row.tours as unknown;
          const t: TourRow | null = Array.isArray(raw)
            ? (raw[0] ?? null)
            : (raw as TourRow | null);

          if (!t || t.status !== "published") return [];

          const cover = (t.tour_images ?? []).find((img) => img.is_cover);

          return [
            {
              id: t.id,
              title: t.title,
              description: t.summary ?? "",
              imageUrl: cover?.path ?? DEFAULT_DESTINATION_HERO,
              startDate: t.start_date,
              endDate: t.end_date,
              priceFrom: t.price_from,
              learnMoreHref: `/tours/${encodeURIComponent(t.slug)}`,
              reverse: i % 2 === 1,
            } satisfies TourCardProps,
          ];
        });
    }
  }

  return (
    <PageShell>
      {/* ── Hero photo + wave ─────────────────────────────────────── */}
      <div className="relative h-[300px] overflow-hidden md:h-[460px]">
        <img
          src={heroImage}
          alt={info.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/25" />

        {/* Destination title overlay */}
        <div className="absolute left-0 right-0 top-0 px-5 pt-8 md:px-10 md:pt-14">
          <div className="mx-auto max-w-[1320px] text-white drop-shadow">
            <p className="text-[14px] opacity-90 md:text-[16px]">
              {info.parentRegion}
            </p>
            <h1 className="text-[34px] font-bold md:text-[52px]">{info.name}</h1>
          </div>
        </div>

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

        {tours.length > 0 ? (
          <div className="space-y-14 md:space-y-24">
            {tours.map((tour) => (
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
