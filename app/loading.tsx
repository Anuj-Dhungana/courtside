import { EventGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Skeleton className="h-64 rounded-2xl sm:h-72" />
      <Skeleton className="mb-5 mt-12 h-7 w-32" />
      <EventGridSkeleton count={3} />
      <Skeleton className="mb-5 mt-12 h-7 w-44" />
      <EventGridSkeleton count={6} />
    </div>
  );
}
