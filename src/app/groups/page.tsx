import { Italianno } from "next/font/google";
import { PageShell } from "@/components/nav/page-shell";
import { GroupTable } from "@/components/groups/group-table";

const italianno = Italianno({ subsets: ["latin"], weight: "400" });

// airplane-wing-at-sunset photo (replace with Figma asset once MCP limit resets)
const BANNER_IMAGE =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1440&q=80";

export default function GroupsPage() {
  return (
    <PageShell>
      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="relative h-[260px] overflow-hidden md:h-[380px]">
        <img
          src={BANNER_IMAGE}
          alt="出團一覽表"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* subtle dark gradient so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/40" />

        {/* Title — right-aligned, vertically centred */}
        <div className="relative z-10 flex h-full items-center justify-end pr-8 md:pr-16">
          <h1 className="text-right leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            <span className="block text-[28px] font-bold md:text-[44px]">
              出團一覽表
            </span>
            <span className={`${italianno.className} text-[28px] md:text-[44px]`}>
              Departure Group List
            </span>
          </h1>
        </div>
      </div>

      {/* ── Group table ─────────────────────────────────────────────── */}
      <GroupTable />
    </PageShell>
  );
}
