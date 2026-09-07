import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchExperience } from "@/components/events/SearchExperience";
import { EventGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search live and upcoming sports events, teams and sports on CourtSide.",
  alternates: { canonical: "/search" },
  robots: { index: false },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-400">
          Find anything
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Search
        </h1>
      </header>
      <Suspense
        fallback={
          <div>
            <Skeleton className="h-14 rounded-xl" />
            <div className="mt-8">
              <EventGridSkeleton count={6} />
            </div>
          </div>
        }
      >
        <SearchExperience />
      </Suspense>
    </div>
  );
}
