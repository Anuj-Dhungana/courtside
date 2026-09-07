import { EventGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function LiveLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Skeleton className="mb-2 h-4 w-16" />
      <Skeleton className="mb-8 h-10 w-56" />
      <Skeleton className="mb-6 h-11 w-full" />
      <EventGridSkeleton count={6} />
    </div>
  );
}
