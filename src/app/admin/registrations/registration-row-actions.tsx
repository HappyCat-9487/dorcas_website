"use client";

import { useTransition } from "react";
import {
    cancelRegistration,
    confirmRegistration,
    deleteRegistration,
    restoreRegistration,
} from "./actions";

type Status = "pending" | "confirmed" | "cancelled";

type Props = {
    id: string;
    status: Status;
};

export function RegistrationRowActions({ id, status }: Props) {
    const [pending, startTransition] = useTransition();

    function run(action: () => Promise<void>) {
        startTransition(async () => {
            try {
                await action();
            } catch (err) {
                alert(err instanceof Error ? err.message : "操作失敗");
            }
        });
    }

    function onDelete() {
        if (!confirm("確定要永久刪除這筆報名嗎？此操作無法復原。")) return;
        run(() => deleteRegistration(id));
    }

    return (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
            {status !== "confirmed" && (
                <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => confirmRegistration(id))}
                    className="rounded-md bg-[#5bbfa8] px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    ✓ 確認
                </button>
            )}
            {status !== "cancelled" ? (
                <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => cancelRegistration(id))}
                    className="rounded-md border border-[#e07070]/40 px-2.5 py-1 text-xs font-medium text-[#b04545] transition-colors hover:bg-[#fbe9e9] disabled:opacity-50"
                >
                    取消
                </button>
            ) : (
                <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => restoreRegistration(id))}
                    className="rounded-md border border-[#e8c9a0] px-2.5 py-1 text-xs font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30 disabled:opacity-50"
                >
                    還原
                </button>
            )}
            <button
                type="button"
                disabled={pending}
                onClick={onDelete}
                className="rounded-md border border-[#7a4020]/30 px-2.5 py-1 text-xs font-medium text-[#7a4020]/60 transition-colors hover:bg-[#f5ca91]/20 disabled:opacity-50"
                title="永久刪除"
            >
                🗑
            </button>
        </div>
    );
}
