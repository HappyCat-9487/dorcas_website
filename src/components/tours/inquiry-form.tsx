"use client";

import { useState, useTransition } from "react";
import { submitInquiry } from "@/app/inquiries/actions";

type Props = {
    tourId: string | null;
    tourTitle: string | null;
};

type Status =
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "success" }
    | { kind: "error"; message: string };

export function InquiryForm({ tourId, tourTitle }: Props) {
    const [name,    setName]    = useState("");
    const [phone,   setPhone]   = useState("");
    const [email,   setEmail]   = useState("");
    const [message, setMessage] = useState("");
    const [agreed,  setAgreed]  = useState(false);
    const [status,  setStatus]  = useState<Status>({ kind: "idle" });
    const [, startTransition] = useTransition();

    // Honeypot: hidden field that real users never see or fill.
    // Bots that blindly fill every input will trigger this.
    const [website, setWebsite] = useState("");

    function clientValidate(): string | null {
        if (!name.trim()) return "請填寫姓名。";
        if (!agreed)      return "請閱讀並同意隱私權政策。";
        if (!phone.trim() && !email.trim()) {
            return "請至少留下手機號碼或 Email，方便我們聯繫您。";
        }
        return null;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const issue = clientValidate();
        if (issue) {
            setStatus({ kind: "error", message: issue });
            return;
        }

        setStatus({ kind: "submitting" });

        startTransition(async () => {
            const result = await submitInquiry({
                tourId,
                tourTitle,
                name,
                phone,
                email,
                message,
                agreedPrivacy: agreed,
                honeypot: website,
            });

            if (result.ok) {
                setStatus({ kind: "success" });
                setName(""); setPhone(""); setEmail(""); setMessage("");
                setAgreed(false);
            } else {
                setStatus({ kind: "error", message: result.error });
            }
        });
    }

    const submitting = status.kind === "submitting";

    return (
        <form className="mx-auto max-w-2xl space-y-5" onSubmit={handleSubmit}>
            <Row label="姓名:">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                    className={inputCls}
                />
            </Row>
            <Row label="手機號碼:">
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={submitting}
                    className={inputCls}
                />
            </Row>
            <Row label="Email:">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    className={inputCls}
                />
            </Row>
            <Row label="需求說明:" alignTop>
                <textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={submitting}
                    className="w-full rounded border border-black/10 bg-white/80 p-3 text-[15px] outline-none focus:border-[#e8928a] disabled:opacity-60"
                />
            </Row>

            <div className="flex items-center gap-2 pl-[126px]">
                <input
                    type="checkbox"
                    id="privacy"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    disabled={submitting}
                    className="accent-[#e8928a]"
                />
                <label htmlFor="privacy" className="text-[13px] text-black/60">
                    我已經閱讀
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#e8928a]">隱私權政策</a>
                    並同意其內容
                </label>
            </div>

            {/* ── Honeypot: invisible to humans, filled by bots ───────── */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 0, height: 0, overflow: "hidden" }}>
                <label htmlFor="website">Website (leave blank)</label>
                <input
                    id="website"
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>

            {status.kind === "error" && (
                <p className="pl-[126px] text-sm font-medium text-red-600">
                    {status.message}
                </p>
            )}
            {status.kind === "success" && (
                <p className="pl-[126px] text-sm font-medium text-green-700">
                    已送出，我們會盡快與您聯繫，謝謝！
                </p>
            )}

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-[#e8928a] px-12 py-3 text-[16px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "送出中…" : "送出"}
                </button>
            </div>
        </form>
    );
}

const inputCls =
    "h-10 w-full rounded border border-black/10 bg-white/80 px-3 text-[15px] outline-none focus:border-[#e8928a] disabled:opacity-60";

function Row({
    label, alignTop = false, children,
}: {
    label: string;
    alignTop?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={`grid grid-cols-[110px_1fr] gap-4 ${alignTop ? "items-start" : "items-center"}`}>
            <label className={`text-right text-[15px] text-black/70 ${alignTop ? "pt-2" : ""}`}>
                {label}
            </label>
            {children}
        </div>
    );
}
