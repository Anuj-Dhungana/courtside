import Link from "next/link";

import { EmptyState } from "@/components/ui/EmptyState";

export default function EventNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <EmptyState
        title="Event not found"
        description="This event may have finished and been removed from the schedule, or the link may be incorrect."
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
