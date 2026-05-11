"use client";

import { useState, useTransition } from "react";
import { submitRegistration } from "@/app/registrations/actions";

type Props = {
    tourId: string;
    tourTitle: string;
    /** Number of seats still left, used to cap the party_size <select>. */
    seatsLeft: number | null;
};

type Status =
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "success" }
    | { kind: "error"; message: string };

const inputCls =
    "h-10 w-full rounded-md border border-black/15 bg-white px-3 text-[15px] text-[#5a3e28] outline-none focus:border-[#e8928a] disabled:opacity-60";
const textareaCls =
    "w-full rounded-md border border-black/15 bg-white p-3 text-[15px] text-[#5a3e28] outline-none focus:border-[#e8928a] disabled:opacity-60";

export function RegistrationForm({ tourId, tourTitle, seatsLeft }: Props) {
    // ── Personal ──────────────────────────────────────────────────
    const [lastZh,  setLastZh]  = useState("");
    const [firstZh, setFirstZh] = useState("");
    const [lastEn,  setLastEn]  = useState("");
    const [firstEn, setFirstEn] = useState("");
    const [gender,  setGender]  = useState("");
    const [birthday, setBirthday] = useState("");
    const [nationalId, setNationalId] = useState("");
    const [passportNo, setPassportNo] = useState("");
    const [passportExpiry, setPassportExpiry] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    // ── Trip ──────────────────────────────────────────────────────
    const [partySize, setPartySize] = useState(1);
    const [room, setRoom] = useState("");
    const [dietary, setDietary] = useState("");
    const [special, setSpecial] = useState("");

    // ── Emergency ─────────────────────────────────────────────────
    const [emName, setEmName] = useState("");
    const [emRelation, setEmRelation] = useState("");
    const [emPhone, setEmPhone] = useState("");

    // ── Consents ──────────────────────────────────────────────────
    const [agreedPrivacy, setAgreedPrivacy] = useState(false);
    const [agreedTerms,   setAgreedTerms]   = useState(false);
    const [agreedMarketing, setAgreedMarketing] = useState(false);

    // Honeypot.
    const [website, setWebsite] = useState("");

    const [status, setStatus] = useState<Status>({ kind: "idle" });
    const [, startTransition] = useTransition();

    const maxParty = seatsLeft ?? 20;

    function clientValidate(): string | null {
        if (!lastZh.trim() || !firstZh.trim()) return "請填寫中文姓名。";
        if (!lastEn.trim() || !firstEn.trim()) return "請填寫英文姓名（拼音同護照）。";
        if (!passportNo.trim()) return "請填寫護照號碼。";
        if (!phone.trim()) return "請填寫手機號碼。";
        if (!email.trim()) return "請填寫 Email。";
        if (partySize < 1) return "報名人數至少 1 位。";
        if (seatsLeft !== null && partySize > seatsLeft) {
            return `本團剩餘 ${seatsLeft} 位，請調整報名人數。`;
        }
        if (!agreedPrivacy) return "請勾選並同意隱私權政策。";
        if (!agreedTerms) return "請勾選並同意國外旅遊定型化契約。";
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
            const result = await submitRegistration({
                tourId,
                tourTitle,
                lastNameZh: lastZh,
                firstNameZh: firstZh,
                lastNameEn: lastEn,
                firstNameEn: firstEn,
                gender,
                birthday,
                nationalId,
                passportNo,
                passportExpiry,
                phone,
                email,
                address,
                partySize,
                roomPreference: room,
                dietary,
                specialRequests: special,
                emergencyName: emName,
                emergencyRelation: emRelation,
                emergencyPhone: emPhone,
                agreedPrivacy,
                agreedTerms,
                agreedMarketing,
                honeypot: website,
            });

            if (result.ok) {
                setStatus({ kind: "success" });
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setStatus({ kind: "error", message: result.error });
            }
        });
    }

    if (status.kind === "success") {
        return (
            <div className="rounded-2xl border border-[#5bbfa8]/30 bg-[#e6f7f1] p-8 text-center">
                <h2 className="text-[22px] font-semibold text-[#2a8b75] md:text-[26px]">
                    已收到您的報名
                </h2>
                <p className="mt-3 text-[15px] text-black/70">
                    我們會盡快與您聯繫確認後續細節（同行旅客資料也會請業務一併蒐集）。
                </p>
            </div>
        );
    }

    const submitting = status.kind === "submitting";

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            {/* ── Section: 代表報名人 ──────────────────────────────── */}
            <section className="space-y-4">
                <SectionHeader title="代表報名人資料" hint="請依護照所載資料填寫，以利訂位。" />

                <Two>
                    <Field label="中文姓 *">
                        <input value={lastZh} onChange={(e) => setLastZh(e.target.value)} disabled={submitting} className={inputCls} />
                    </Field>
                    <Field label="中文名 *">
                        <input value={firstZh} onChange={(e) => setFirstZh(e.target.value)} disabled={submitting} className={inputCls} />
                    </Field>
                </Two>

                <Two>
                    <Field label="英文 Last Name *" hint="同護照拼音，例如 CHEN">
                        <input value={lastEn} onChange={(e) => setLastEn(e.target.value.toUpperCase())} disabled={submitting} className={inputCls} />
                    </Field>
                    <Field label="英文 First Name *" hint="同護照拼音，例如 MEI-LING">
                        <input value={firstEn} onChange={(e) => setFirstEn(e.target.value.toUpperCase())} disabled={submitting} className={inputCls} />
                    </Field>
                </Two>

                <Two>
                    <Field label="性別">
                        <select value={gender} onChange={(e) => setGender(e.target.value)} disabled={submitting} className={inputCls}>
                            <option value="">請選擇</option>
                            <option value="male">男</option>
                            <option value="female">女</option>
                            <option value="other">其他 / 不公開</option>
                        </select>
                    </Field>
                    <Field label="出生年月日">
                        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} disabled={submitting} className={inputCls} />
                    </Field>
                </Two>

                <Two>
                    <Field label="身分證字號">
                        <input value={nationalId} onChange={(e) => setNationalId(e.target.value.toUpperCase())} disabled={submitting} className={inputCls} placeholder="例如 A123456789" />
                    </Field>
                    <Field label="護照號碼 *">
                        <input value={passportNo} onChange={(e) => setPassportNo(e.target.value.toUpperCase())} disabled={submitting} className={inputCls} />
                    </Field>
                </Two>

                <Two>
                    <Field label="護照有效期限" hint="一般需離團日後 6 個月以上">
                        <input type="date" value={passportExpiry} onChange={(e) => setPassportExpiry(e.target.value)} disabled={submitting} className={inputCls} />
                    </Field>
                    <Field label="手機 *">
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={submitting} className={inputCls} placeholder="0912-345-678" />
                    </Field>
                </Two>

                <Field label="Email *">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} className={inputCls} />
                </Field>

                <Field label="通訊地址">
                    <input value={address} onChange={(e) => setAddress(e.target.value)} disabled={submitting} className={inputCls} />
                </Field>
            </section>

            {/* ── Section: 旅遊資訊 ──────────────────────────────── */}
            <section className="space-y-4">
                <SectionHeader title="旅遊資訊" />

                <Two>
                    <Field label="報名人數（含本人）" hint={
                        seatsLeft !== null
                            ? `本團剩餘 ${seatsLeft} 位`
                            : "若同行不只一位，請填總人數，業務會與您聯繫蒐集同行資料"
                    }>
                        <select value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} disabled={submitting} className={inputCls}>
                            {Array.from({ length: maxParty }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>{n} 位</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="房型偏好">
                        <select value={room} onChange={(e) => setRoom(e.target.value)} disabled={submitting} className={inputCls}>
                            <option value="">請選擇</option>
                            <option value="single">單人房（單人房差另計）</option>
                            <option value="double">雙人房</option>
                            <option value="triple">三人房</option>
                        </select>
                    </Field>
                </Two>

                <Field label="飲食 / 過敏" hint="例如：素食、不吃牛、海鮮過敏">
                    <input value={dietary} onChange={(e) => setDietary(e.target.value)} disabled={submitting} className={inputCls} />
                </Field>

                <Field label="其他特殊需求">
                    <textarea rows={3} value={special} onChange={(e) => setSpecial(e.target.value)} disabled={submitting} className={textareaCls} />
                </Field>
            </section>

            {/* ── Section: 緊急聯絡人 ─────────────────────────────── */}
            <section className="space-y-4">
                <SectionHeader title="緊急聯絡人" hint="出國期間如需聯繫家屬使用。" />

                <Two>
                    <Field label="姓名">
                        <input value={emName} onChange={(e) => setEmName(e.target.value)} disabled={submitting} className={inputCls} />
                    </Field>
                    <Field label="關係" hint="例如：配偶／父母／兄弟姐妹">
                        <input value={emRelation} onChange={(e) => setEmRelation(e.target.value)} disabled={submitting} className={inputCls} />
                    </Field>
                </Two>

                <Field label="聯絡電話">
                    <input type="tel" value={emPhone} onChange={(e) => setEmPhone(e.target.value)} disabled={submitting} className={inputCls} />
                </Field>
            </section>

            {/* ── Section: 同意事項 ───────────────────────────────── */}
            <section className="space-y-3 rounded-xl border border-black/10 bg-[#fdf7ee] p-5">
                <SectionHeader title="同意事項" />
                <Consent
                    checked={agreedPrivacy}
                    onChange={setAgreedPrivacy}
                    disabled={submitting}
                >
                    （必勾）我已閱讀並同意
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="mx-1 underline hover:text-[#e8928a]">
                        隱私權政策
                    </a>
                    ，依個人資料保護法授權多加旅行社蒐集、處理及利用本表單所填資料於行程辦理之必要範圍。
                </Consent>
                <Consent
                    checked={agreedTerms}
                    onChange={setAgreedTerms}
                    disabled={submitting}
                >
                    （必勾）我已閱讀並同意交通部觀光局
                    <a
                        href="https://gobus.tbroc.gov.tw/Subject/SubjectListPub.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-1 underline hover:text-[#e8928a]"
                    >
                        《國外旅遊定型化契約》
                    </a>
                    所載各項條款。
                </Consent>
                <Consent
                    checked={agreedMarketing}
                    onChange={setAgreedMarketing}
                    disabled={submitting}
                >
                    （選填）願意接收多加旅行社不定期寄送之行程／優惠／活動資訊。
                </Consent>
            </section>

            {/* Honeypot (invisible to humans) */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 0, height: 0, overflow: "hidden" }}>
                <label htmlFor="website-hp">Website (leave blank)</label>
                <input id="website-hp" type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
            </div>

            {status.kind === "error" && (
                <p className="text-sm font-medium text-red-600">{status.message}</p>
            )}

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-[#e8928a] px-12 py-3 text-[16px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "送出中…" : "送出報名"}
                </button>
            </div>
        </form>
    );
}

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
    return (
        <div>
            <h3 className="text-[18px] font-semibold text-[#7a4020] md:text-[20px]">{title}</h3>
            {hint && <p className="mt-1 text-xs text-black/50">{hint}</p>}
        </div>
    );
}

function Two({ children }: { children: React.ReactNode }) {
    return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block space-y-1.5">
            <span className="block text-[13px] font-medium text-[#7a4020]">{label}</span>
            {children}
            {hint && <span className="block text-xs text-black/40">{hint}</span>}
        </label>
    );
}

function Consent({
    checked,
    onChange,
    disabled,
    children,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed text-black/70">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="mt-1 size-4 accent-[#e8928a]"
            />
            <span>{children}</span>
        </label>
    );
}
