import { Italianno } from "next/font/google";
import { PageShell } from "@/components/nav/page-shell";
import { GroupTable } from "@/components/groups/group-table";
import type { GroupTour } from "@/components/groups/constants";
import { getSiteSetting } from "@/lib/site-settings";
import { supabaseAnon } from "@/lib/supabase/server";
import {
  computeTripDays,
  todayISODateInTimeZone,
  TOUR_DATE_TZ,
} from "@/lib/tour-dates";

const italianno = Italianno({ subsets: ["latin"], weight: "400" });

// airplane-wing-at-sunset photo (replace with Figma asset once MCP limit resets)
const FALLBACK_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1440&q=80";

// Always re-read published tours from Supabase on every visit so the table
// stays in sync with admin edits.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

async function loadGroupRows(): Promise<GroupTour[]> {
  const sb = supabaseAnon();
  const today = todayISODateInTimeZone(TOUR_DATE_TZ);

  // Only show upcoming tours (start_date >= today). Tours whose start date has
  // already passed shouldn't clutter the overview.
  const { data, error } = await sb
    .from("tours")
    .select(
      "title, slug, price_from, airline, visa, start_date, end_date",
    )
    .eq("status", "published")
    .not("start_date", "is", null)
    .gte("start_date", today)
    .order("start_date", { ascending: true });

  if (error || !data) return [];

  return data.map((t): GroupTour => ({
    date: formatTravelDate(t.start_date ?? null, t.end_date ?? null),
    tripName: t.title,
    days: computeTripDays(t.start_date, t.end_date),
    airline: t.airline ?? null,
    visa: t.visa ?? null,
    price: formatPrice(t.price_from ?? null),
    status: "報名", // capacity / 額滿 tracking is a future feature
    href: `/tours/${encodeURIComponent(t.slug)}`,
  }));
}

export default async function GroupsPage() {
  const [bannerUrl, rows] = await Promise.all([
    getSiteSetting("groups_hero_image"),
    loadGroupRows(),
  ]);
  const resolvedBanner = bannerUrl ?? FALLBACK_BANNER_IMAGE;

  return (
    <PageShell>
      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="relative h-[260px] overflow-hidden md:h-[380px]">
        <img
          src={resolvedBanner}
          alt="出團一覽表"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/40" />

        <div className="relative z-10 flex h-full items-center justify-end pr-8 md:pr-16">
          <h1 className="text-right leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            <span className="block text-[28px] font-bold md:text-[44px]">
              出團一覽表
            </span>
            <span className={`${italianno.className} text-[28px] md:text-[44px]`}>
              Departure Group List
            </span>
          </h1>
        </div>
      </div>

      {/* ── Group table ─────────────────────────────────────────────── */}
      <div className="bg-[#f5ca91] pt-6 md:pt-10">
        <GroupTable rows={rows} />
      </div>
    </PageShell>
  );
}
