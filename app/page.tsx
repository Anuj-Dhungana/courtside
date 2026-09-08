import Link from "next/link";
import { Suspense } from "react";

import { EventGrid } from "@/components/events/EventGrid";
import { SportCard } from "@/components/sports/SportCard";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventGridSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { groupEventsByDay } from "@/lib/utils/format";
import {
  getLiveEvents,
  getPopularEvents,
  getSportsWithCounts,
  getTodayEvents,
} from "@/server/services/catalog";

export const revalidate = 30;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Popular Live */}
      <section aria-labelledby="popular-heading">
        <SectionHeading title="Popular Live" eyebrow="Trending" href="/live" />
        <Suspense fallback={<EventGridSkeleton count={6} />}>
          <PopularSection />
        </Suspense>
      </section>

      {/* Upcoming Popular */}
      <section aria-labelledby="upcoming-popular-heading" className="mt-12">
        <SectionHeading title="Upcoming Popular" eyebrow="Coming Up" />
        <Suspense fallback={<EventGridSkeleton count={6} />}>
          <UpcomingPopularSection />
        </Suspense>
      </section>

      {/* Upcoming */}
      <section aria-labelledby="upcoming-heading" className="mt-12">
        <SectionHeading title="Upcoming Today" eyebrow="Schedule" />
        <Suspense fallback={<EventGridSkeleton count={6} />}>
          <UpcomingSection />
        </Suspense>
      </section>

      {/* Sports */}
      <section aria-labelledby="sports-heading" className="mt-12">
        <SectionHeading
          title="Browse Sports"
          eyebrow="Explore"
          href="/sports"
        />
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          }
        >
          <SportsSection />
        </Suspense>
      </section>
    </div>
  );
}

async function PopularSection() {
  try {
    const live = await getLiveEvents();
    const popularLive = live.filter((e) => e.popular);
    if (popularLive.length === 0) {
      return (
        <EmptyState
          title="No popular live events right now"
          description="The most-watched matches will appear here when they go live."
        />
      );
    }
    return <EventGrid events={popularLive.slice(0, 6)} />;
  } catch {
    return <ErrorState title="Unable to load popular live events" />;
  }
}

async function UpcomingPopularSection() {
  try {
    const popular = await getPopularEvents();
    const upcomingPopular = popular
      .filter(
        (e) =>
          e.status === "scheduled" ||
          e.status === "upcoming" ||
          e.status === "delayed",
      )
      .slice(0, 6);

    if (upcomingPopular.length === 0) {
      return (
        <EmptyState
          title="No upcoming popular events scheduled"
          description="Featured and trending upcoming matches will appear here."
        />
      );
    }
    return <EventGrid events={upcomingPopular} />;
  } catch {
    return <ErrorState title="Unable to load upcoming popular events" />;
  }
}

async function UpcomingSection() {
  try {
    const today = await getTodayEvents();
    const upcoming = today
      .filter(
        (e) =>
          e.status === "scheduled" ||
          e.status === "upcoming" ||
          e.status === "delayed",
      )
      .slice(0, 12);
    if (upcoming.length === 0) {
      return (
        <EmptyState
          title="No more events scheduled today"
          description="Browse individual sports to see the full upcoming schedule."
          action={
            <Link
              href="/sports"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-surface-950 transition-colors hover:bg-brand-400"
            >
              Browse sports
            </Link>
          }
        />
      );
    }
    const groups = groupEventsByDay(upcoming);
    return (
      <div className="space-y-8">
        {groups.map((g) => (
          <div key={g.label}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">
              {g.label}
            </h3>
            <EventGrid events={g.events} />
          </div>
        ))}
      </div>
    );
  } catch {
    return <ErrorState title="Unable to load today's events" />;
  }
}

async function SportsSection() {
  try {
    const sports = await getSportsWithCounts();
    if (sports.length === 0) {
      return <EmptyState title="Sports are temporarily unavailable" />;
    }
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {sports.map((s) => (
          <SportCard key={s.id} sport={s} />
        ))}
      </div>
    );
  } catch {
    return <ErrorState title="Unable to load sports" />;
  }
}
