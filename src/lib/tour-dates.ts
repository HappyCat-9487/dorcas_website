/** Business timezone for “today” checks (Taiwan). */
export const TOUR_DATE_TZ = "Asia/Taipei";

/** YYYY-MM-DD for “today” in the given IANA timezone. */
export function todayISODateInTimeZone(timeZone: string): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    if (!y || !m || !d) throw new Error("Date formatting failed");
    return `${y}-${m}-${d}`;
}

/**
 * Returns a user-facing Traditional Chinese message if invalid, else null.
 * Rules: both required, YYYY-MM-DD, start <= end, neither before “today” in TOUR_DATE_TZ.
 */
export function tourDateRangeIssue(start: string, end: string): string | null {
    const s = start.trim();
    const e = end.trim();
    if (!s || !e) {
        return "此日期組合不允許，請重新選擇。（請同時填寫起始與結束日期。）";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !/^\d{4}-\d{2}-\d{2}$/.test(e)) {
        return "此日期組合不允許，請重新選擇。（日期格式不正確。）";
    }
    if (s > e) {
        return "此日期組合不允許，請重新選擇。（起始日期不可晚於結束日期。）";
    }
    const today = todayISODateInTimeZone(TOUR_DATE_TZ);
    if (s < today || e < today) {
        return "此日期組合不允許，請重新選擇。（兩者皆不可早於今天，以台灣時區計算。）";
    }
    return null;
}

export function assertValidTourDateRange(start: string, end: string): void {
    const issue = tourDateRangeIssue(start, end);
    if (issue) throw new Error(issue);
}

/**
 * Compute trip length in days, inclusive of both endpoints.
 * e.g. 2026-05-17 ~ 2026-05-23 → 7 (matches industry "X 日遊" usage).
 * Returns null if either input is missing or invalid.
 */
export function computeTripDays(
    start: string | null | undefined,
    end: string | null | undefined,
): number | null {
    if (!start || !end) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
        return null;
    }
    const s = new Date(start + "T00:00:00Z").getTime();
    const e = new Date(end + "T00:00:00Z").getTime();
    if (isNaN(s) || isNaN(e) || e < s) return null;
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    return Math.round((e - s) / MS_PER_DAY) + 1;
}
