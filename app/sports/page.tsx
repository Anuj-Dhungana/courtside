import type { Metadata } from "next";

import { SportCard } from "@/components/sports/SportCard";
import { ErrorState } from "@/components/ui/EmptyState";
import { getSportsWithCounts } from "@/server/services/catalog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "All Sports",
  description:
    "Browse every sport on CourtSide — live events, fixtures and schedules for football, basketball, tennis, cricket, motorsports and more.",
  alternates: { canonical: "/sports" },
};

export default async function SportsPage() {
  let sports;
  try {
    sports = await getSportsWithCounts();
  } catch {
    sports = null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-400">
          Explore
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          All Sports
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-500">
          Pick a sport to see what&apos;s live now, what&apos;s coming up and
          what recently finished.
        </p>
      </header>

      {!sports ? (
        <ErrorState
          title="Unable to load sports"
          description="The sports list is temporarily unavailable. Please refresh in a moment."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sports.map((s) => (
            <SportCard key={s.id} sport={s} />
          ))}
        </div>
      )}
    </div>
  );
}
