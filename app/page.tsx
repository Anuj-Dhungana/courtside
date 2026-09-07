import Link from "next/link";
import { Suspense } from "react";

import { EventGrid } from "@/components/events/EventGrid";
import { HeroEvent } from "@/components/events/HeroEvent";
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
      {/* Hero */}
      <section aria-label="Featured event">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl sm:h-72" />}>
          <HeroSection />
        </Suspense>
      </section>

      {/* Live now */}
      <section aria-labelledby="live-heading" className="mt-12">
        <SectionHeading title="Live Now" eyebrow="Happening" href="/live" />
        <Suspense fallback={<EventGridSkeleton count={3} />}>
          <LiveSection />
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

async function HeroSection() {
  try {
    const [popular, live] = await Promise.all([
      getPopularEvents().catch(() => []),
      getLiveEvents().catch(() => []),
    ]);
    const featured =
      live.find((e) => e.popular) ??
      live[0] ??
      popular.find((e) => e.status === "upcoming") ??
      popular[0];
    if (!featured) {
      return (
        <div className="rounded-2xl border border-surface-700/60 bg-gradient-to-br from-surface-850 to-surface-950 p-10 text-center">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Every match. <span className="text-brand-400">One place.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-ink-500">
            Live scores, schedules and event details across the world of sport.
          </p>
        </div>
      );
    }
    return <HeroEvent event={featured} />;
  } catch {
    return (
      <ErrorState
        title="Unable to load today's events"
        description="Event data is temporarily unavailable. Please refresh in a moment."
      />
    );
  }
}

async function LiveSection() {
  try {
    const live = await getLiveEvents();
    if (live.length === 0) {
      return (
        <EmptyState
          title="No live events right now"
          description="Check the schedule below — the next events are just around the corner."
        />
      );
    }
    return <EventGrid events={live.slice(0, 6)} />;
  } catch {
    return <ErrorState title="Unable to load live events" />;
  }
}

async function UpcomingSection() {
  try {
    const today = await getTodayEvents();
    const upcoming = today.filter((e) => e.status === "upcoming").slice(0, 12);
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
