export type ItineraryStop = {
  name: string;
  description: string;
  imageUrl: string;
  reverse?: boolean;
};

export type DepartureRow = {
  /** Formatted travel dates, e.g. "2026/5/17 – 2026/5/23" (or just start date). */
  travelDate: string;
  tourName: string;
  days: number | null;
  airline: string | null;
  visa: string | null;
  pricePerPerson: string | null;
  /** Defaults to "open". "full" support reserved for future capacity tracking. */
  status: "open" | "full";
};

export type TourDetail = {
  slug: string;
  title: string;
  heroImage: string;
  stops: ItineraryStop[];
  departures: DepartureRow[];
};

export const tourDetails: Record<string, TourDetail> = {
  "norway-aurora": {
    slug: "norway-aurora",
    title: "挪威極光之七日遊",
    heroImage: "/figures/NorwayAurora.jpg",
    departures: [
      {
        travelDate: "2026/5/17 – 2026/5/23",
        tourName: "挪威極光之七日遊",
        days: 7,
        airline: "長榮航空",
        visa: "免簽",
        pricePerPerson: "NT$ 179,000",
        status: "full",
      },
      {
        travelDate: "2026/8/14 – 2026/8/20",
        tourName: "挪威極光之七日遊",
        days: 7,
        airline: "長榮航空",
        visa: "免簽",
        pricePerPerson: "NT$ 179,000",
        status: "open",
      },
      {
        travelDate: "2026/9/28 – 2026/10/4",
        tourName: "挪威極光之七日遊",
        days: 7,
        airline: "中華航空",
        visa: "免簽",
        pricePerPerson: "NT$ 179,000",
        status: "open",
      },
    ],
    stops: [
      {
        name: "維格蘭雕塑公園",
        description:
          "位於挪威奧斯陸，是世界上最大的單一藝術家雕塑公園。公園展示了古斯塔夫·維格蘭的200多座花崗岩、青銅和鑄鐵雕塑，主題聚焦於「人生」，刻畫了人類從生到死的百態。核心區域包括生命之橋、噴泉、壯觀的生命之柱及生命之輪，全年24小時免費開放，是奧斯陸必遊景點。",
        imageUrl: "/figures/vigelandsparken.jpg",
      },
      {
        name: "Hamnøy 漁村",
        description:
          "是挪威諾爾蘭郡莫斯克內斯市的一個小漁村。它位於Moskenesøya島東側的一個小半島上，位於雷訥村東北約1.5公里處，沿著Vestfjorden。Hamnøya 以前透過渡輪與雷訥相連，但後來被歐洲 E10 高速公路上的橋樑取代，作為羅弗敦大陸連接的一部分。",
        imageUrl: "/figures/Norway_north.jpg",
        reverse: true,
      },
      {
        name: "挪威極光",
        description:
          "挪威是全球最佳極光觀測地之一，三分之一國土位於北極圈內，以特羅姆瑟、羅弗敦群島等地最為著名。每年11月至隔年4月，太陽帶電粒子與大氣碰撞，會在夜空上演夢幻的「綠色舞動」奇景，傳說看見此「極光女神」的人將獲得一生幸福與幸運。",
        imageUrl: "/figures/Norway_Aurora_2.jpg",
      },
    ],
  },
};
