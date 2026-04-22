import { regionDropdowns } from "@/components/home/constants";

/**
 * Every destination page the site supports.  Derived from the region
 * dropdowns on the homepage so that clicking any sub-region link in
 * the nav always lands on a valid `/destinations/{slug}` page.
 */
export type DestinationInfo = {
  /** URL slug, e.g. "north-europe" */
  slug: string;
  /** Display name in Chinese, e.g. "北歐" */
  name: string;
  /** Parent region header, e.g. "歐洲" */
  parentRegion: string;
};

export const destinations: DestinationInfo[] = Object.entries(regionDropdowns)
  .flatMap(([parentRegion, items]) =>
    items.map((item) => ({
      slug: item.href.replace("/destinations/", ""),
      name: item.label,
      parentRegion,
    })),
  );

export const destinationsBySlug: Record<string, DestinationInfo> =
  Object.fromEntries(destinations.map((d) => [d.slug, d]));

/**
 * Supabase `site_settings` key that stores the hero banner URL
 * for a given destination page.
 */
export function destinationHeroKey(slug: string): string {
  return `destination_hero_${slug}`;
}

/**
 * Fallback hero image shown when the admin hasn't uploaded
 * a destination-specific banner yet.
 */
export const DEFAULT_DESTINATION_HERO = "/figures/Norway_Aurora.jpg";
