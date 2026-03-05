import { tripFeatures } from "@/src/components/home/constants";
import { HomeHero } from "@/src/components/home/home-hero";
import { TripFeatureRow } from "@/src/components/home/trip-feature-row";

export function Homepage() {
  return (
    <main className="bg-[#f5ca91] text-black">
      <HomeHero />

      <section className="mx-auto max-w-[1440px] space-y-10 px-4 pb-14 md:space-y-14 md:px-10 md:pb-20">
        {tripFeatures.map((feature) => (
          <TripFeatureRow key={feature.title} {...feature} />
        ))}
      </section>
    </main>
  );
}
