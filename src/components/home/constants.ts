export const HERO_IMAGE =
  "https://www.figma.com/api/mcp/asset/0f832b69-2c4e-4d5e-a936-15681e5354a6";
export const LOGO_IMAGE =
  "https://www.figma.com/api/mcp/asset/6c7739d6-4bc4-46e3-aef8-a4f414f93327";

export const regionTabs = ["台灣", "亞洲", "美洲", "大洋洲", "歐洲", "非洲", "主題式"];

export type DropdownItem = { label: string; href: string };

export const regionDropdowns: Record<string, DropdownItem[]> = {
  台灣: [
    { label: "北部", href: "/destinations/taiwan-north" },
    { label: "中部", href: "/destinations/taiwan-central" },
    { label: "南部", href: "/destinations/taiwan-south" },
    { label: "東部", href: "/destinations/taiwan-east" },
    { label: "離島", href: "/destinations/taiwan-islands" },
  ],
  亞洲: [
    { label: "日本",       href: "/destinations/japan" },
    { label: "韓國",       href: "/destinations/korea" },
    { label: "蒙古/俄羅斯", href: "/destinations/mongolia-russia" },
    { label: "東南亞",     href: "/destinations/southeast-asia" },
  ],
  美洲: [
    { label: "美國",  href: "/destinations/usa" },
    { label: "加拿大", href: "/destinations/canada" },
  ],
  大洋洲: [
    { label: "澳洲",  href: "/destinations/australia" },
    { label: "紐西蘭", href: "/destinations/new-zealand" },
  ],
  歐洲: [
    { label: "北歐", href: "/destinations/north-europe" },
    { label: "西歐", href: "/destinations/west-europe" },
    { label: "南歐", href: "/destinations/south-europe" },
    { label: "東歐", href: "/destinations/east-europe" },
  ],
  非洲: [
    { label: "北非",   href: "/destinations/north-africa" },
    { label: "摩洛哥", href: "/destinations/morocco" },
    { label: "東非",   href: "/destinations/east-africa" },
    { label: "南非",   href: "/destinations/south-africa" },
    { label: "非洲其他", href: "/destinations/africa-other" },
  ],
  主題式: [
    { label: "海島渡遊", href: "/destinations/island" },
    { label: "蜜月旅行", href: "/destinations/honeymoon" },
    { label: "冬季滑雪", href: "/destinations/ski" },
    { label: "文化體驗", href: "/destinations/culture" },
    { label: "櫻花季",  href: "/destinations/cherry-blossom" },
    { label: "薰衣草季", href: "/destinations/lavender" },
  ],
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
