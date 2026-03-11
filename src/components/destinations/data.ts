export type TourPackage = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  departureDates: string[];
  price: string;
  learnMoreHref?: string;
  reverse?: boolean;
};

export type DestinationData = {
  name: string;
  heroImage: string;
  tours: TourPackage[];
};

export const destinationPages: Record<string, DestinationData> = {
  "north-europe": {
    name: "北歐",
    heroImage: "/figures/Norway_Aurora.jpg",
    tours: [
      {
        id: "norway-aurora",
        title: "挪威極光之七日遊",
        description: "奧斯陸, 特隆赫姆, 特羅姆瑟, 挪威烤鮭魚",
        imageUrl: "/figures/NorwayAurora.jpg",
        departureDates: ["5月17號", "8月14號", "9月28號"],
        price: "NT$ 179,000",
        learnMoreHref: "/tours/norway-aurora",
      },
      {
        id: "scandinavia-10days",
        title: "北歐四國之十日遊",
        description: "丹麥哥本哈根, 挪威峽灣, 瑞典斯德哥爾摩, 芬蘭赫爾辛基",
        imageUrl: "/figures/Copehagen.jpg",
        departureDates: ["7月10號", "01月15號"],
        price: "NT$ 209,000",
        learnMoreHref: "#",
        reverse: true,
      },
      {
        id: "iceland-honeymoon",
        title: "冰島蜜月之遊",
        description: "雷克雅維克, 極光, 溫泉, 黑沙灘",
        imageUrl: "/figures/iceland.jpg",
        departureDates: ["10月7號", "8月14號", "7月28號"],
        price: "NT$ 309,000",
        learnMoreHref: "#",
      },
    ],
  },

  "west-europe": {
    name: "西歐",
    heroImage:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1440&q=80",
    tours: [],
  },

  "south-europe": {
    name: "南歐",
    heroImage:
      "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1440&q=80",
    tours: [],
  },

  "east-europe": {
    name: "東歐",
    heroImage:
      "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1440&q=80",
    tours: [],
  },
};
