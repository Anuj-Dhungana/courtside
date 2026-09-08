import type { Metadata } from "next";
import { Suspense } from "react";

import { UpcomingFixtureCard } from "@/components/events/UpcomingFixtureCard";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventGridSkeleton } from "@/components/ui/Skeleton";
import { groupEventsByDay } from "@/lib/utils/format";
import { getAllEvents } from "@/server/services/catalog";

export const metadata: Metadata = {
  title: "Schedule — Upcoming Matches & Fixtures",
  description:
    "Explore the upcoming sports schedule across football, basketball, tennis, and more.",
};

export const revalidate = 30;

export default function SchedulePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeading
        title="Match Schedule"
        eyebrow="Fixtures"
      />
      <Suspense fallback={<EventGridSkeleton count={8} />}>
        <ScheduleContent />
      </Suspense>
    </div>
  );
}

async function ScheduleContent() {
  try {
    const all = await getAllEvents();
    const upcoming = all.filter(
      (e) =>
        e.status === "scheduled" ||
        e.status === "upcoming" ||
        e.status === "delayed",
    );

    if (upcoming.length === 0) {
      return (
        <EmptyState
          title="No upcoming fixtures scheduled"
          description="Check back soon for new broadcast schedules."
        />
      );
    }

    const groups = groupEventsByDay(upcoming);

    return (
      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400">
                {group.label}
              </h3>
              <span className="rounded-full bg-surface-800 px-2 py-0.5 text-[11px] font-semibold text-ink-300">
                {group.events.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {group.events.map((event) => (
                <UpcomingFixtureCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  } catch {
    return <ErrorState title="Unable to load match schedule" />;
  }
}
