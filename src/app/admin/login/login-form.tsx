"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

const initialState = { error: null as string | null };

export function LoginForm({ next }: { next: string }) {
    const [state, formAction, pending] = useActionState(signIn, initialState);

    return (
        <form action={formAction} className="space-y-5">
            <input type="hidden" name="next" value={next} />

            <div className="space-y-1.5">
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#7a4020]"
                >
                    電子郵件
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@example.com"
                    className="w-full rounded-xl border border-[#e8c9a0] bg-[#fdf7ee] px-4 py-2.5 text-sm text-[#4a2610] placeholder-[#c9a97a] focus:border-[#e8928a] focus:outline-none focus:ring-2 focus:ring-[#e8928a]/20"
                />
            </div>

            <div className="space-y-1.5">
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#7a4020]"
                >
                    密碼
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#e8c9a0] bg-[#fdf7ee] px-4 py-2.5 text-sm text-[#4a2610] placeholder-[#c9a97a] focus:border-[#e8928a] focus:outline-none focus:ring-2 focus:ring-[#e8928a]/20"
                />
            </div>

            {state.error ? (
                <p
                    role="alert"
                    className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700"
                >
                    {state.error}
                </p>
            ) : null}

            <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-[#b83553] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending ? "登入中…" : "登入後台"}
            </button>
        </form>
    );
}
