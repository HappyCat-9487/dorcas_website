"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "首頁",       href: "/" },
  { label: "聯絡我們",   href: "/contact" },
  { label: "團體總列表", href: "/groups" },
  { label: "訂票服務說明", href: "/booking-explain" },
];

export function MenuOverlay() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger / close button */}
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="absolute right-0 top-1 z-50 text-white md:top-3"
      >
        {open ? (
          <X className="size-8 md:size-10" />
        ) : (
          <Menu className="size-8 md:size-10" />
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Overlay panel — slides in from top-right */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 w-[300px] md:w-[390px]",
          "flex flex-col gap-2 rounded-bl-2xl p-3 pt-[76px]",
          "bg-white/50 backdrop-blur-sm",
          "shadow-[0px_74px_100px_0px_rgba(0,0,0,0.14)]",
          "transition-all duration-300",
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-4 opacity-0 pointer-events-none",
        )}
      >
        {navLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex h-[45px] w-full items-center justify-center rounded-lg px-4",
              "font-mono text-[18px] font-bold text-black",
              "transition hover:bg-white/60",
              pathname === href && "bg-white/70",
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}
