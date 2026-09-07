import { EventGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <Skeleton className="mb-2 h-3 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="mb-8 h-14 rounded-xl" />
      <EventGridSkeleton count={6} />
    </div>
  );
}
