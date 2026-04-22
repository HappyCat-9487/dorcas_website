"use client";

import { useCallback, useState } from "react";
import { CategorySelector } from "@/components/admin/category-selector";
import type { Category } from "@/components/admin/category-selector";
import { tourDateRangeIssue } from "@/lib/tour-dates";

type TourRow = {
    title: string;
    summary: string | null;
    price_from: string | null;
    start_date: string | null;
    end_date: string | null;
    updated_at: string;
};

type Props = {
    minDate: string;
    tour: TourRow;
    categories: Category[];
    savedParentId: string;
    savedChildId: string;
    isPublished: boolean;
    isFeaturedOnHome: boolean;
    saveAction: (formData: FormData) => Promise<void>;
    publishAction: (formData: FormData) => Promise<void>;
    unpublishAction: () => Promise<void>;
    toggleFeaturedOnHomeAction: () => Promise<void>;
};

const dateInputBase =
    "w-full rounded-lg border bg-[#fdf7ee] px-3 py-2 text-sm text-[#7a4020] focus:outline-none";
const dateInputOk = "border-[#e8c9a0] focus:border-[#e8928a]";
const dateInputErr =
    "border-red-600 ring-1 ring-red-500 focus:border-red-600";

export function AdminTourInfoForm({
    minDate,
    tour,
    categories,
    savedParentId,
    savedChildId,
    isPublished,
    isFeaturedOnHome,
    saveAction,
    publishAction,
    unpublishAction,
    toggleFeaturedOnHomeAction,
}: Props) {
    const [dateError, setDateError] = useState<string | null>(null);

    const clearDateErrorIfFixed = useCallback((start: string, end: string) => {
        if (dateError && tourDateRangeIssue(start, end) === null) {
            setDateError(null);
        }
    }, [dateError]);

    const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
        const native = e.nativeEvent as SubmitEvent;
        const btn = native.submitter as HTMLButtonElement | null;
        if (btn?.dataset.skipDateValidation === "true") {
            setDateError(null);
            return;
        }

        const fd = new FormData(e.currentTarget);
        const start = String(fd.get("start_date") ?? "").trim();
        const end = String(fd.get("end_date") ?? "").trim();
        const issue = tourDateRangeIssue(start, end);
        if (issue) {
            e.preventDefault();
            setDateError(issue);
        } else {
            setDateError(null);
        }
    };

    return (
        <form
            className="space-y-4 rounded-xl border border-[#e8c9a0] bg-white p-6"
            onSubmit={onSubmitForm}
        >
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#b83553]">
                行程資訊
            </h2>

            <div className="space-y-1">
                <label className="text-sm font-medium text-[#7a4020]">
                    Title（行程名稱）
                </label>
                <input
                    name="title"
                    defaultValue={tour.title}
                    required
                    className="w-full rounded-lg border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-2 text-sm focus:border-[#e8928a] focus:outline-none"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-[#7a4020]">
                    Summary（簡介）
                </label>
                <input
                    name="summary"
                    defaultValue={tour.summary ?? ""}
                    className="w-full rounded-lg border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-2 text-sm focus:border-[#e8928a] focus:outline-none"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-[#7a4020]">
                    起始價格（台幣，Price from）
                </label>
                <div className="flex items-center gap-0 overflow-hidden rounded-lg border border-[#e8c9a0] focus-within:border-[#e8928a]">
                    <span className="shrink-0 border-r border-[#e8c9a0] bg-[#f5ca91]/30 px-3 py-2 text-sm font-medium text-[#7a4020]">
                        NT$
                    </span>
                    <input
                        name="price_from"
                        type="number"
                        min={0}
                        step={1000}
                        defaultValue={tour.price_from ?? ""}
                        placeholder="179000"
                        className="w-full bg-[#fdf7ee] px-3 py-2 text-sm focus:outline-none"
                    />
                </div>
                <p className="text-xs text-[#7a4020]/40">只輸入數字，例如 179000</p>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-[#7a4020]">
                    出發日期範圍
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <span className="text-xs text-[#7a4020]/50">起始日期</span>
                        <input
                            name="start_date"
                            type="date"
                            min={minDate}
                            defaultValue={tour.start_date ?? ""}
                            onChange={(ev) => {
                                const form = ev.currentTarget.form;
                                const endEl = form?.elements.namedItem(
                                    "end_date",
                                ) as HTMLInputElement | null;
                                clearDateErrorIfFixed(
                                    ev.currentTarget.value,
                                    endEl?.value ?? "",
                                );
                            }}
                            className={`${dateInputBase} ${dateError ? dateInputErr : dateInputOk}`}
                        />
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-[#7a4020]/50">結束日期</span>
                        <input
                            name="end_date"
                            type="date"
                            min={minDate}
                            defaultValue={tour.end_date ?? ""}
                            onChange={(ev) => {
                                const form = ev.currentTarget.form;
                                const startEl = form?.elements.namedItem(
                                    "start_date",
                                ) as HTMLInputElement | null;
                                clearDateErrorIfFixed(
                                    startEl?.value ?? "",
                                    ev.currentTarget.value,
                                );
                            }}
                            className={`${dateInputBase} ${dateError ? dateInputErr : dateInputOk}`}
                        />
                    </div>
                </div>
                {dateError ? (
                    <p
                        className="mt-1 border-l-4 border-red-600 pl-2 text-sm text-red-700"
                        role="alert"
                    >
                        {dateError}
                    </p>
                ) : null}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-[#7a4020]">
                    Category（地區分類）
                </label>
                <CategorySelector
                    key={`${savedParentId || "none"}-${savedChildId || "none"}-${tour.updated_at}`}
                    categories={categories}
                    initialParentId={savedParentId}
                    initialChildId={savedChildId}
                />
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[#e8c9a0] pt-4">
                <button
                    type="submit"
                    formAction={saveAction}
                    className="rounded-lg border border-[#e8c9a0] bg-white px-5 py-2 text-sm font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                >
                    儲存草稿
                </button>

                {!isPublished && (
                    <button
                        type="submit"
                        formAction={publishAction}
                        className="rounded-lg bg-[#e8928a] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        儲存並發佈
                    </button>
                )}

                {isPublished && (
                    <button
                        type="submit"
                        formAction={unpublishAction}
                        data-skip-date-validation="true"
                        className="rounded-lg border border-[#e8928a] px-5 py-2 text-sm font-medium text-[#e8928a] transition-colors hover:bg-[#e8928a]/10"
                    >
                        取消發佈
                    </button>
                )}

                {isPublished && (
                    <button
                        type="submit"
                        formAction={toggleFeaturedOnHomeAction}
                        data-skip-date-validation="true"
                        className={
                            isFeaturedOnHome
                                ? "rounded-lg border border-[#7a4020] bg-[#fdf7ee] px-5 py-2 text-sm font-medium text-[#7a4020] transition-colors hover:bg-[#f5ca91]/30"
                                : "rounded-lg bg-[#7a4020] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        }
                        title={
                            isFeaturedOnHome
                                ? "此行程已顯示於首頁，點擊可從首頁移除"
                                : "點擊後此行程會顯示在首頁"
                        }
                    >
                        {isFeaturedOnHome ? "已在主頁（點擊移除）" : "也發佈主頁"}
                    </button>
                )}
            </div>

            {isPublished && (
                <p className="text-xs text-[#7a4020]/50">
                    {isFeaturedOnHome
                        ? "✨ 這個行程會出現在首頁「行程精選」區。"
                        : "首頁自動依最接近的出發日補滿 3 則，若想確定顯示，點「也發佈主頁」。"}
                </p>
            )}
        </form>
    );
}
