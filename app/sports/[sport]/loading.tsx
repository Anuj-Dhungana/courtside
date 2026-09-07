import { EventGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function SportLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-10 flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
      </div>
      <Skeleton className="mb-5 h-7 w-24" />
      <EventGridSkeleton count={3} />
      <Skeleton className="mb-5 mt-12 h-7 w-32" />
      <EventGridSkeleton count={6} />
    </div>
  );
}
