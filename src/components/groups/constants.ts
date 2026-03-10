export type TourStatus = "額滿" | "報名";

export type GroupTour = {
  date: string;
  tripName: string;
  days: number;
  airline: string;
  visa: string;
  price: string;
  status: TourStatus;
};

export const groupTours: GroupTour[] = [
  {
    date: "2026/5/17",
    tripName: "挪威極光之七日遊",
    days: 7,
    airline: "長榮航空",
    visa: "免簽",
    price: "NT$ 179,000",
    status: "額滿",
  },
  {
    date: "2026/8/14",
    tripName: "挪威極光之七日遊",
    days: 7,
    airline: "長榮航空",
    visa: "免簽",
    price: "NT$ 179,000",
    status: "報名",
  },
  {
    date: "2026/9/28",
    tripName: "挪威極光之七日遊",
    days: 7,
    airline: "中華航空",
    visa: "免簽",
    price: "NT$ 179,000",
    status: "報名",
  },
];
