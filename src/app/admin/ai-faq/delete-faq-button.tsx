"use client";

import { useTransition } from "react";
import { deleteFaq } from "./actions";

export function DeleteFaqButton({ id }: { id: string }) {
    const [pending, startTransition] = useTransition();

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (!confirm("確定要刪除這條 FAQ？此動作無法復原。")) return;
                const fd = new FormData();
                fd.set("id", id);
                startTransition(async () => {
                    await deleteFaq(fd);
                });
            }}
        >
            <button
                type="submit"
                disabled={pending}
                className="rounded-lg border border-red-200 px-2.5 py-1 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
                {pending ? "刪除中…" : "刪除"}
            </button>
        </form>
    );
}
