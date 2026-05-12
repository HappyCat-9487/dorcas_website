"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTour } from "./actions";

type Props = {
    tourId: string;
    tourTitle: string;
};

export function DeleteTourButton({ tourId, tourTitle }: Props) {
    const [pending, startTransition] = useTransition();

    function handleClick() {
        const ok = confirm(
            `確定刪除「${tourTitle}」嗎？\n\n` +
                `此動作會永久移除這個行程以及它的景點、分類、封面圖等所有資料，無法復原。`,
        );
        if (!ok) return;
        startTransition(async () => {
            try {
                await deleteTour(tourId);
            } catch (err) {
                alert(
                    "刪除失敗：" +
                        (err instanceof Error ? err.message : String(err)),
                );
            }
        });
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            title="刪除此行程"
            aria-label={`刪除 ${tourTitle}`}
            className="inline-flex items-center justify-center rounded-lg border border-[#e8928a]/40 bg-[#e8928a] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
            {pending ? (
                <span className="text-[11px]">刪除中…</span>
            ) : (
                <Trash2 className="size-3.5" strokeWidth={2.2} />
            )}
        </button>
    );
}
