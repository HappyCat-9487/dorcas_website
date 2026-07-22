import Link from "next/link";
import { MenuOverlay } from "@/components/nav/menu-overlay";
import { RegionTabs } from "@/components/home/region-tabs";
import { SocialRail } from "@/components/home/social-rail";
import { getSiteSetting } from "@/lib/site-settings";

export async function PageShell({
  children,
  hideSocialRail = false,
}: {
  children: React.ReactNode;
  hideSocialRail?: boolean;
}) {
  const logoUrl = await getSiteSetting("logo_image");

  return (
    <div className="min-h-screen bg-[#f5ca91] text-black">
      {/* ── Red header bar ─────────────────────────────────────── */}
      <header className="bg-[#d26a6a] px-5 pb-4 pt-5 md:px-10 md:pb-5 md:pt-6">
        <div className="relative mx-auto flex max-w-[1440px] items-center justify-center">
          <Link href="/" aria-label="Homepage">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Dorcas Travel logo"
                className="h-[52px] w-auto object-contain md:h-[72px]"
              />
            ) : null}
          </Link>
          <MenuOverlay />
        </div>
        <div className="mx-auto mt-4 max-w-[1440px] md:mt-5">
          <RegionTabs />
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────── */}
      <main>{children}</main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-[#7a4020] px-5 py-6 text-center text-xs text-[#f5e8d8]/70 md:px-10 md:py-8">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span>© {new Date().getFullYear()} 多加旅行社有限公司</span>
          <span className="hidden md:inline">|</span>
          <Link href="/privacy" className="underline-offset-4 hover:text-white hover:underline">
            隱私權政策
          </Link>
          <span className="hidden md:inline">|</span>
          <Link href="/contact" className="underline-offset-4 hover:text-white hover:underline">
            聯絡我們
          </Link>
        </div>
      </footer>

      {/* ── Fixed social rail — hidden on pages that opt out ───── */}
      {!hideSocialRail && <SocialRail />}
    </div>
  );
}
