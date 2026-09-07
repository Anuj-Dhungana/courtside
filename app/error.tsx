"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/EmptyState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-side breadcrumb only; server logs carry the technical detail.
    console.error("page_error", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred while loading this page. Please try again."
        action={
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-surface-950 transition-colors hover:bg-brand-400"
          >
            Try again
          </button>
        }
      />
    </div>
  );
}
