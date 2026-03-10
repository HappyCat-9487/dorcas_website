import Link from "next/link";
import { MenuOverlay } from "@/components/nav/menu-overlay";
import { RegionTabs } from "@/components/home/region-tabs";

const LOGO_IMAGE =
  "https://www.figma.com/api/mcp/asset/6c7739d6-4bc4-46e3-aef8-a4f414f93327";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5ca91] text-black">
      {/* ── Red header bar ─────────────────────────────────────── */}
      <header className="bg-[#d26a6a] px-5 pb-4 pt-5 md:px-10 md:pb-5 md:pt-6">
        <div className="relative mx-auto flex max-w-[1440px] items-center justify-center">
          <Link href="/" aria-label="Homepage">
            <img
              src={LOGO_IMAGE}
              alt="Dorcas Travel logo"
              className="h-[52px] w-auto object-contain md:h-[72px]"
            />
          </Link>
          <MenuOverlay />
        </div>
        <div className="mx-auto mt-4 max-w-[1440px] md:mt-5">
          <RegionTabs />
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────── */}
      <main>{children}</main>
    </div>
  );
}
