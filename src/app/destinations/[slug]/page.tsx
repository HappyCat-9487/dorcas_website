import { notFound } from "next/navigation";
import { Italianno } from "next/font/google";
import { PageShell } from "@/components/nav/page-shell";
import { TourCard } from "@/components/destinations/tour-card";
import { destinationPages } from "@/components/destinations/data";

const italianno = Italianno({ subsets: ["latin"], weight: "400" });

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return Object.keys(destinationPages).map((slug) => ({ slug }));
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const data = destinationPages[slug];

  if (!data) notFound();

  return (
    <PageShell>
      {/* ── Hero photo + wave (overflow-hidden keeps everything clipped) ── */}
      <div className="relative h-[300px] overflow-hidden md:h-[460px]">
        <img
          src={data.heroImage}
          alt={data.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/25" />

        {/* Wave sits at the bottom edge, fill matches the sandy background */}
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

      {/* ── Content area ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-4 md:px-10 md:pb-24 md:pt-8">

        {/* "Rejseplan? 行程列表？" heading */}
        <h1 className="mb-10 leading-snug md:mb-14">
          <span className={`${italianno.className} text-[48px] md:text-[60px]`}>
            Rejseplan?
          </span>
          <span className="ml-2 text-[22px] md:text-[28px]">行程列表？</span>
        </h1>

        {/* Tour cards */}
        {data.tours.length > 0 ? (
          <div className="space-y-14 md:space-y-24">
            {data.tours.map((tour) => (
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
