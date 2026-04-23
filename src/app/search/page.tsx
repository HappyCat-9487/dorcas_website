import Link from "next/link";
import { PageShell } from "@/components/nav/page-shell";
import { TourCard, type TourCardProps } from "@/components/destinations/tour-card";
import {
  destinationsBySlug,
  DEFAULT_DESTINATION_HERO,
} from "@/components/destinations/constants";
import { supabaseAnon } from "@/lib/supabase/server";
import { computeTripDays } from "@/lib/tour-dates";

// Always search fresh results – otherwise published tours wouldn't show up
// until the next rebuild.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = {
  start?: string; // ISO YYYY-MM-DD
  end?:   string;
  days?:  string; // "short" | "medium" | "long"
  dest?:  string; // category slug
  q?:     string;
};

type TourRow = {
  id: string;
  title: string;
  summary: string | null;
  slug: string;
  price_from: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  tour_images: { path: string; is_cover: boolean }[] | null;
};

/**
 * PostgREST's `.or("title.ilike.%x%,summary.ilike.%x%")` is comma-separated,
 * so commas and parens inside the keyword would break the filter. Strip them.
 * `%` and `_` are SQL wildcards → strip them too so the user can't unexpectedly
 * match everything.
 */
function sanitizeKeyword(raw: string): string {
  return raw.replace(/[,()%_*]/g, " ").trim();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const sb = supabaseAnon();

  // --- Destination filter (category slug → id) -------------------------
  let filterByCategoryId: string | null | undefined;
  if (params.dest) {
    const { data: cat } = await sb
      .from("categories")
      .select("id")
      .eq("slug", params.dest)
      .maybeSingle();
    filterByCategoryId = cat?.id ?? null;
  }

  // --- Build query ----------------------------------------------------
  let rows: TourRow[] = [];
  let queryError: string | null = null;

  // If a destination filter was requested but we couldn't resolve it, just
  // return nothing instead of returning all tours.
  if (filterByCategoryId === null) {
    rows = [];
  } else {
    let q = sb
      .from("tours")
      .select(
        `
        id, title, summary, slug, price_from,
        start_date, end_date, status,
        tour_images ( path, is_cover ),
        tour_categories!inner ( category_id )
        `,
      )
      .eq("status", "published");

    if (filterByCategoryId) {
      q = q.eq("tour_categories.category_id", filterByCategoryId);
    }
    if (params.start) q = q.gte("start_date", params.start);
    if (params.end)   q = q.lte("end_date",   params.end);

    if (params.q) {
      const kw = sanitizeKeyword(params.q);
      if (kw) q = q.or(`title.ilike.%${kw}%,summary.ilike.%${kw}%`);
    }

    const { data, error } = await q.order("start_date", { ascending: true });
    if (error) {
      queryError = error.message;
    } else {
      // Dedupe in case the inner join on tour_categories returned duplicates.
      const seen = new Set<string>();
      rows = ((data as TourRow[] | null) ?? []).filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
    }
  }

  // --- Duration filter (post-fetch, derived from dates) --------------
  if (params.days && ["short", "medium", "long"].includes(params.days)) {
    rows = rows.filter((r) => {
      const d = computeTripDays(r.start_date, r.end_date);
      if (d === null) return false;
      if (params.days === "short")  return d <= 5;
      if (params.days === "medium") return d >= 6 && d <= 9;
      if (params.days === "long")   return d >= 10;
      return true;
    });
  }

  const tours: TourCardProps[] = rows.map((t, i) => {
    const cover = (t.tour_images ?? []).find((img) => img.is_cover);
    return {
      id: t.id,
      title: t.title,
      description: t.summary ?? "",
      imageUrl: cover?.path ?? DEFAULT_DESTINATION_HERO,
      startDate: t.start_date,
      endDate: t.end_date,
      priceFrom: t.price_from,
      learnMoreHref: `/tours/${encodeURIComponent(t.slug)}`,
      reverse: i % 2 === 1,
    };
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-14">
        <Link
          href="/"
          className="text-sm text-[#7a4020]/70 hover:text-[#7a4020] hover:underline md:text-base"
        >
          ← 回首頁
        </Link>

        <h1 className="mt-3 text-[28px] font-semibold text-[#5a3e28] md:text-[36px]">
          行程搜尋結果
        </h1>
        <p className="mt-2 text-sm text-black/60 md:text-base">
          {describeFilters(params)}・共 {tours.length} 筆
        </p>

        {queryError ? (
          <p className="mt-10 text-red-600">搜尋發生錯誤：{queryError}</p>
        ) : tours.length === 0 ? (
          <p className="mt-16 text-center text-[18px] text-black/50 md:text-[22px]">
            找不到符合條件的行程，請調整篩選條件再試一次。
          </p>
        ) : (
          <div className="mt-10 space-y-14 md:mt-14 md:space-y-24">
            {tours.map((t) => (
              <TourCard key={t.id} {...t} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function describeFilters(p: SearchParams): string {
  const bits: string[] = [];
  if (p.start || p.end) {
    bits.push(`日期 ${p.start ?? "?"} ~ ${p.end ?? "?"}`);
  }
  if (p.days === "short")  bits.push("5 天以下");
  if (p.days === "medium") bits.push("6–9 天");
  if (p.days === "long")   bits.push("10 天以上");
  if (p.dest) {
    const d = destinationsBySlug[p.dest];
    bits.push(`地區：${d ? `${d.parentRegion}・${d.name}` : p.dest}`);
  }
  if (p.q) bits.push(`關鍵字：「${p.q}」`);
  return bits.length ? bits.join("、") : "所有已發佈行程";
}
