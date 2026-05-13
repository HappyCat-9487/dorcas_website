"use client";

import { useEffect, useMemo, useState } from "react";

export type Category = {
    id: string;
    name: string;
    parent_id: string | null;
};

type Props = {
    categories: Category[];
    /** Child category IDs currently saved on this tour. */
    initialChildIds?: string[];
};

/**
 * Multi-tag category selector.
 *
 * Each tag is a (Region, Sub-region) pair, identified by the sub-region's
 * `id` (the parent is inferred from `parent_id`). Tours can have multiple
 * tags — e.g. "日本賞櫻" can be both "亞洲 › 日本" AND "主題式 › 櫻花季".
 *
 * On save, we emit a single hidden input named "category_ids" containing a
 * comma-separated list of sub-region IDs. The server action looks up the
 * parents and writes both into `tour_categories` so destination filtering
 * keeps working.
 */
export function CategorySelector({
    categories,
    initialChildIds = [],
}: Props) {
    const [selectedChildIds, setSelectedChildIds] = useState<string[]>(initialChildIds);
    const [draftParentId, setDraftParentId] = useState<string>("");
    const [draftChildId, setDraftChildId]   = useState<string>("");

    // Sync local state if server-side initial value changes (e.g. after save).
    useEffect(() => {
        setSelectedChildIds(initialChildIds);
    }, [initialChildIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

    const parents = useMemo(
        () => categories.filter((c) => c.parent_id === null),
        [categories],
    );
    const childrenOfDraftParent = useMemo(
        () => categories.filter((c) => c.parent_id === draftParentId),
        [categories, draftParentId],
    );

    /** Quick lookup id → category */
    const byId = useMemo(() => {
        const m = new Map<string, Category>();
        for (const c of categories) m.set(c.id, c);
        return m;
    }, [categories]);

    function labelFor(childId: string): string {
        const child = byId.get(childId);
        if (!child) return childId;
        const parent = child.parent_id ? byId.get(child.parent_id) : null;
        return parent ? `${parent.name} › ${child.name}` : child.name;
    }

    const alreadyAdded = !!draftChildId && selectedChildIds.includes(draftChildId);
    const canAdd       = !!draftParentId && !!draftChildId && !alreadyAdded;

    function addTag() {
        if (!canAdd) return;
        setSelectedChildIds((prev) => [...prev, draftChildId]);
        setDraftParentId("");
        setDraftChildId("");
    }

    function removeTag(childId: string) {
        setSelectedChildIds((prev) => prev.filter((id) => id !== childId));
    }

    return (
        <div className="space-y-3">
            {/* Hidden input carries selected child IDs into the form. */}
            <input
                type="hidden"
                name="category_ids"
                value={selectedChildIds.join(",")}
            />

            {/* ── Selected tags ────────────────────────────────────────── */}
            <div>
                <div className="mb-1 text-xs font-medium text-[#7a4020]/70">
                    已加入（{selectedChildIds.length} 個）
                </div>
                {selectedChildIds.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[#e8c9a0] bg-[#fdf7ee]/50 px-3 py-2.5 text-xs text-[#7a4020]/40">
                        尚未加入任何分類。請從下方選擇後按「＋ 加入」。
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {selectedChildIds.map((childId) => (
                            <span
                                key={childId}
                                className="inline-flex items-center gap-2 rounded-full border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-1 text-sm text-[#7a4020]"
                            >
                                {labelFor(childId)}
                                <button
                                    type="button"
                                    onClick={() => removeTag(childId)}
                                    aria-label={`移除 ${labelFor(childId)}`}
                                    className="flex size-4 items-center justify-center rounded-full text-[#7a4020]/40 transition-colors hover:bg-[#e8928a] hover:text-white"
                                    title="移除"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Add new tag ──────────────────────────────────────────── */}
            <div className="rounded-lg border border-[#e8c9a0] bg-white p-3">
                <div className="mb-2 text-xs font-medium text-[#7a4020]/70">
                    新增分類
                </div>
                <div className="flex flex-wrap items-end gap-2">
                    <div className="space-y-1">
                        <label className="block text-xs text-[#7a4020]/60">
                            Region
                        </label>
                        <select
                            value={draftParentId}
                            onChange={(e) => {
                                setDraftParentId(e.target.value);
                                setDraftChildId(""); // reset child when parent changes
                            }}
                            className="min-w-[140px] rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-sm focus:border-[#e8928a] focus:outline-none"
                        >
                            <option value="">— 選擇 region —</option>
                            {parents.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs text-[#7a4020]/60">
                            Sub-region
                        </label>
                        <select
                            value={draftChildId}
                            onChange={(e) => setDraftChildId(e.target.value)}
                            disabled={!draftParentId}
                            className="min-w-[160px] rounded-lg border border-[#e8c9a0] bg-white px-3 py-1.5 text-sm focus:border-[#e8928a] focus:outline-none disabled:opacity-40"
                        >
                            <option value="">— 選擇 sub-region —</option>
                            {childrenOfDraftParent.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={addTag}
                        disabled={!canAdd}
                        className="rounded-lg bg-[#e8928a] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        ＋ 加入
                    </button>

                    {alreadyAdded && (
                        <span className="text-xs text-[#b83553]">
                            這個分類已經加入過了。
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
