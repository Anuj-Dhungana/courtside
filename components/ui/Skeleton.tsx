export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`skeleton rounded-lg ${className}`} />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <Skeleton className="mt-4 h-3 w-28" />
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading events"
    >
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function EventHeaderSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-700/60 bg-surface-900 p-6 sm:p-10">
      <div className="flex items-center justify-center gap-6 sm:gap-12">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full sm:h-20 sm:w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-10" />
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full sm:h-20 sm:w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}
