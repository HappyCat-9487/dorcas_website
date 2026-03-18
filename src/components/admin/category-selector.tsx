"use client";

import { useState } from "react";

export type Category = {
    id: string;
    name: string;
    parent_id: string | null;
};

type Props = {
    categories: Category[];
    initialParentId?: string;
    initialChildId?: string;
};

export function CategorySelector({
    categories,
    initialParentId = "",
    initialChildId = "",
}: Props) {
    const [parentId, setParentId] = useState(initialParentId);
    const [childId, setChildId]   = useState(initialChildId);

    const parents  = categories.filter((c) => c.parent_id === null);
    const children = categories.filter((c) => c.parent_id === parentId);

    function handleParentChange(newParentId: string) {
        setParentId(newParentId);
        setChildId(""); // reset child when parent changes
    }

    return (
        <div className="flex flex-wrap gap-3">
            {/* hidden inputs carry the values into any form this lives inside */}
            <input type="hidden" name="parent_category_id" value={parentId} />
            <input type="hidden" name="child_category_id"  value={childId} />

            <div className="space-y-1">
                <label className="block text-sm font-medium">Region</label>
                <select
                    value={parentId}
                    onChange={(e) => handleParentChange(e.target.value)}
                    className="border rounded px-3 py-2 min-w-[160px]"
                >
                    <option value="">— select region —</option>
                    {parents.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium">Sub-region</label>
                <select
                    value={childId}
                    onChange={(e) => setChildId(e.target.value)}
                    disabled={!parentId}
                    className="border rounded px-3 py-2 min-w-[160px] disabled:opacity-40"
                >
                    <option value="">— select sub-region —</option>
                    {children.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
