import { Facebook, Instagram, Sparkles } from "lucide-react";

import styles from "@/src/components/home/homepage.module.css";

export function SocialRail() {
  return (
    <div className="fixed right-8 top-[56%] z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      <button
        aria-label="Instagram"
        className={`grid size-14 place-items-center rounded-xl border-2 border-black bg-[#f5ca91] ${styles.socialIconButton}`}
      >
        <Instagram className="size-7" />
      </button>
      <button
        aria-label="Facebook"
        className={`grid size-14 place-items-center rounded-xl border-2 border-black bg-[#f5ca91] ${styles.socialIconButton}`}
      >
        <Facebook className="size-7" />
      </button>
      <button
        aria-label="AI 咨詢"
        className={`inline-flex items-center gap-1.5 rounded-2xl bg-black px-3 py-2 text-base text-white ${styles.aiPill}`}
      >
        <Sparkles className="size-4" />
        AI 諮詢
      </button>
    </div>
  );
}
