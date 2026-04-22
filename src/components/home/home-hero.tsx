import { getSiteSettings, FALLBACKS } from "@/lib/site-settings";
import { RegionTabs } from "@/components/home/region-tabs";
import { SearchPanel } from "@/components/home/search-panel";
import { SocialRail } from "@/components/home/social-rail";
import { MenuOverlay } from "@/components/nav/menu-overlay";
import styles from "@/components/home/homepage.module.css";
import { Italianno } from "next/font/google";

const italianno = Italianno({
  subsets: ["latin"],
  weight: "400",
});

export async function HomeHero() {
  const settings  = await getSiteSettings();
  const HERO_IMAGE = settings["hero_image"]  ?? null;
  const LOGO_IMAGE = settings["logo_image"]  ?? FALLBACKS["logo_image"];
  return (
    <section className="bg-[#f5ca91]">
      {/* ── Hero photo zone ─────────────────────────────────────────── */}
      <div className="relative h-[420px] overflow-hidden md:h-[580px]">
        {HERO_IMAGE ? (
          <img
            src={HERO_IMAGE}
            alt="Travel beach hero"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#c9a060]" />
        )}
        {/* dark gradient so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/55" />

        {/* ── Content inside the photo ──────────────────────────────── */}
        <div className="relative z-10 mx-auto h-full max-w-[1440px] px-5 pt-5 md:px-10 md:pt-7">
          <header className="relative flex items-center justify-center">
            {LOGO_IMAGE ? (
              <img
                src={LOGO_IMAGE}
                alt="Dorcas Travel logo"
                className="h-[52px] w-auto object-contain md:h-[72px]"
              />
            ) : null}
          <MenuOverlay />
          </header>

          <div className="mt-3 md:mt-5">
            <RegionTabs />
          </div>

          <h1
            className={`mt-6 max-w-[480px] text-[34px] leading-[1.08] text-white md:mt-10 md:max-w-[640px] md:text-[58px] ${styles.headline}`}
          >
            "Ogni angolo,
            <br />
            una storia."
            <br />
            <span className="whitespace-nowrap">每個角落，都是一個故事。</span>
          </h1>
        </div>

        {/* ── Wave cutout at bottom of photo ────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 130"
            preserveAspectRatio="none"
            className="block h-[80px] w-full md:h-[130px]"
            aria-hidden="true"
          >
            <path
              d="M0,80 C200,20 480,110 720,60 C960,10 1200,90 1440,50 L1440,130 L0,130 Z"
              fill="#f5ca91"
            />
          </svg>
        </div>
      </div>

      {/* ── Sandy zone below wave ──────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] grid gap-6 px-5 pb-10 pt-6 md:grid-cols-[1fr_auto] md:gap-10 md:px-10 md:pb-14 md:pt-8 md:pr-28 xl:pr-12">
        <p className="leading-tight">
          <span className={`${italianno.className} text-[60px] md:text-[68px]`}>
            Che programmi?
          </span>{" "}
          <span className="text-[34px] md:text-[50px]">新行程？</span>
        </p>
        <div className="md:justify-self-end">
          <SearchPanel />
        </div>
      </div>

      <SocialRail />
    </section>
  );
}
