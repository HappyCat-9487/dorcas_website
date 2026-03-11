export const HERO_IMAGE =
  "https://www.figma.com/api/mcp/asset/0f832b69-2c4e-4d5e-a936-15681e5354a6";
export const LOGO_IMAGE =
  "https://www.figma.com/api/mcp/asset/6c7739d6-4bc4-46e3-aef8-a4f414f93327";

export const regionTabs = ["台灣", "亞洲", "美洲", "大洋洲", "歐洲", "非洲", "主題式"];

export const regionDropdowns: Record<string, string[]> = {
  台灣: ["北部", "中部", "南部", "東部", "離島"],
  亞洲: ["日本", "韓國", "蒙古/俄羅斯", "東南亞"],
  美洲: ["美國", "加拿大"],
  大洋洲: ["澳洲", "紐西蘭"],
  歐洲: ["北歐", "西歐", "南歐", "東歐"],
  非洲: ["北非", "摩洛哥", "東非", "南非", "非洲其他"],
  主題式: ["海島渡遊", "蜜月旅行", "冬季滑雪", "文化體驗", "櫻花季", "薰衣草季"],
};

export type TripFeature = {
  title: string;
  imageUrl: string;
  reverse?: boolean;
  imageHeightClass?: string;
  detailHeightClass?: string;
};

export const tripFeatures: TripFeature[] = [
  {
    title: "波蘭 - 東歐之醉",
    imageUrl: "https://www.figma.com/api/mcp/asset/011dbfea-c26f-4ccc-b5a7-b274c0ceab7a",
    imageHeightClass: "h-[300px] md:h-[390px]",
    detailHeightClass: "h-[300px]",
  },
  {
    title: "日本 - 櫻花季",
    imageUrl: "https://www.figma.com/api/mcp/asset/92df66ae-e4be-4d38-8506-61cd4e9f7f77",
    reverse: true,
    imageHeightClass: "h-[320px] md:h-[476px]",
    detailHeightClass: "h-[320px]",
  },
  {
    title: "速度與激情 - 撒哈拉沙漠越野之旅",
    imageUrl: "https://www.figma.com/api/mcp/asset/38e5c773-cc90-4ae8-930f-78b28ecfb51c",
    imageHeightClass: "h-[280px] md:h-[430px]",
    detailHeightClass: "h-[300px] md:h-[380px]",
  },
];
