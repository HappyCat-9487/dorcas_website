import { HERO_IMAGE, LOGO_IMAGE } from "@/src/components/home/constants";
import { RegionTabs } from "@/src/components/home/region-tabs";
import { SearchPanel } from "@/src/components/home/search-panel";
import { SocialRail } from "@/src/components/home/social-rail";
import styles from "@/src/components/home/homepage.module.css";
import { Menu } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative min-h-[920px] overflow-hidden">
      <img
        src={HERO_IMAGE}
        alt="Travel beach hero"
        className="absolute inset-x-0 top-0 h-[560px] w-full object-cover"
      />
      <div className="absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-black/10 to-black/45" />
      <div className={`absolute inset-x-0 top-[350px] h-[280px] bg-[#f5ca91] ${styles.heroCurve}`} />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 pt-7 md:px-10">
        <header className="relative flex items-center justify-center">
          <img src={LOGO_IMAGE} alt="Dorcas Travel logo" className="h-20 w-auto object-contain" />
          <button aria-label="Menu" className="absolute right-0 top-4 text-zinc-700">
            <Menu className="size-11" />
          </button>
        </header>

        <div className="mt-6">
          <RegionTabs />
        </div>

        <h1
          className={`mt-10 max-w-[710px] text-[52px] leading-[1.02] text-white md:text-[64px] ${styles.headline}`}
        >
          ”Ogni angolo,
          <br />
          una storia.“
          <br />
          每個角落，都是一個故事。
        </h1>
      </div>

      <div className="relative z-10 mx-auto mt-24 grid max-w-[1440px] gap-6 px-6 md:grid-cols-[1fr_auto] md:px-10">
        <p className="pt-2 leading-tight">
          <span className={`${styles.scriptPrompt} text-[56px]`}>Che programmi?</span>{" "}
          <span className="text-[48px]">新行程？</span>
        </p>
        <div className="md:justify-self-end">
          <SearchPanel />
        </div>
      </div>

      <SocialRail />
    </section>
  );
}
