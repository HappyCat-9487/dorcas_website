import { tripFeatures } from "@/src/components/home/constants";
import { HomeHero } from "@/src/components/home/home-hero";
import { TripFeatureRow } from "@/src/components/home/trip-feature-row";

export function Homepage() {
  return (
    <main className="bg-[#f5ca91] text-black">
      <HomeHero />

      <section className="mx-auto max-w-[1440px] space-y-14 px-6 pb-20 md:px-10">
        {tripFeatures.map((feature) => (
          <TripFeatureRow key={feature.title} {...feature} />
        ))}
      </section>
    </main>
  );
}
