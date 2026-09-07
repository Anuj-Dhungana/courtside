import Link from "next/link";

import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <EmptyState
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Link
            href="/"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-surface-950 transition-colors hover:bg-brand-400"
          >
            Back to home
          </Link>
        }
      />
    </div>
  );
}
