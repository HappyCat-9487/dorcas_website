"use client";

import { useRef, useState, useTransition } from "react";
import type { createTour } from "./actions";

type Props = {
  action: typeof createTour;
};

export function CreateTourForm({ action }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function validate(formData: FormData): boolean {
    const title = String(formData.get("title") || "").trim();
    if (!title) {
      setError("請先輸入行程名稱，才能建立草稿。");
      return false;
    }
    setError(null);
    return true;
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        if (!validate(formData)) return;

        startTransition(async () => {
          // If server throws, Next will still show the overlay; but we prevent
          // the most common error (empty title) on the client side.
          await action(formData);
        });
      }}
      className="space-y-2"
    >
      <div className="flex gap-2">
        <input
          name="title"
          placeholder="輸入行程名稱..."
          className="flex-1 rounded-lg border border-[#e8c9a0] bg-[#fdf7ee] px-3 py-2 text-sm focus:border-[#e8928a] focus:outline-none"
          aria-invalid={Boolean(error)}
          onChange={() => {
            if (error) setError(null);
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#e8928a] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "建立中…" : "建立草稿"}
        </button>
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </form>
  );
}

