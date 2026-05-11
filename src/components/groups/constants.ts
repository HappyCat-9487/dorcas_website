export type TourStatus = "額滿" | "報名";

export type GroupTour = {
  /** Formatted travel-date string, e.g. "2026/5/17 – 2026/5/23" */
  date: string;
  tripName: string;
  days: number | null;
  airline: string | null;
  visa: string | null;
  price: string | null;
  status: TourStatus;
  /** Link to the tour detail page (the row itself). */
  href?: string;
  /** Where clicking 報名 takes the user. Required when status is "報名". */
  registerHref?: string;
};
