import {
  EventGridSkeleton,
  EventHeaderSkeleton,
  Skeleton,
} from "@/components/ui/Skeleton";

export default function EventLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Skeleton className="mb-6 h-4 w-64" />
      <EventHeaderSkeleton />
      <Skeleton className="mb-5 mt-10 h-7 w-40" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
      <Skeleton className="mb-5 mt-14 h-7 w-40" />
      <EventGridSkeleton count={3} />
    </div>
  );
}
