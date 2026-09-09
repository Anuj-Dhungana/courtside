import { cookies } from "next/headers";
import { Suspense } from "react";

import { PopularLiveCard } from "@/components/events/PopularLiveCard";
import { UpcomingFixtureCard } from "@/components/events/UpcomingFixtureCard";
import { UpcomingScheduleSection } from "@/components/home/UpcomingScheduleSection";
import { SportCard } from "@/components/sports/SportCard";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getAllEvents,
  getLiveEvents,
  getPopularEvents,
  getSportsWithCounts,
  getTodayEvents,
} from "@/server/services/catalog";
import type { SportEvent } from "@/types";

export const revalidate = 30;

async function getServerTimezone(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    const tz = cookieStore.get("user-tz")?.value;
    return tz ? decodeURIComponent(tz) : undefined;
  } catch {
    return undefined;
  }
}

function deduplicateEvents(events: SportEvent[]): SportEvent[] {
  const seen = new Set<string>();
  const result: SportEvent[] = [];

  for (const e of events) {
    const key =
      e.home && e.away
        ? `${e.sportId}:${e.home.name.toLowerCase().replace(/[^a-z0-9]/g, "")}:${e.away.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`
        : `${e.sportId}:${e.title.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(e);
    }
  }
  return result;
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-3.5 py-5 sm:px-6 sm:py-8">
      {/* 1. Popular Live */}
      <section aria-labelledby="popular-heading">
        <SectionHeading title="Popular Live" eyebrow="Trending" href="/live" />
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-4/5 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
              ))}
            </div>
          }
        >
          <PopularSection />
        </Suspense>
      </section>

      {/* 2. Upcoming Popular */}
      <section aria-labelledby="upcoming-popular-heading" className="mt-10 sm:mt-12">
        <SectionHeading
          title="Upcoming Popular"
          eyebrow="Coming Up"
          href="/schedule"
        />
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-4/5 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
              ))}
            </div>
          }
        >
          <UpcomingPopularSection />
        </Suspense>
      </section>

      {/* 3. Upcoming Today & Tomorrow */}
      <section aria-labelledby="upcoming-heading" className="mt-10 sm:mt-12">
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          }
        >
          <UpcomingSection />
        </Suspense>
      </section>

      {/* 4. Browse Sports */}
      <section aria-labelledby="sports-heading" className="mt-10 sm:mt-12">
        <SectionHeading
          title="Browse Sports"
          eyebrow="Explore"
          href="/sports"
        />
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
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
    const [live, userTz] = await Promise.all([
      getLiveEvents(),
      getServerTimezone(),
    ]);
    const popularLive = live.filter((e) => e.popular);
    const displayEvents = deduplicateEvents(
      popularLive.length > 0 ? popularLive : live,
    );

    if (displayEvents.length === 0) {
      return (
        <EmptyState
          title="No live events right now"
          description="The most-watched matches will appear here when they go live."
        />
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {displayEvents.slice(0, 6).map((e) => (
          <PopularLiveCard key={e.id} event={e} serverTimezone={userTz} />
        ))}
      </div>
    );
  } catch {
    return <ErrorState title="Unable to load popular live events" />;
  }
}

async function UpcomingPopularSection() {
  try {
    const [popular, userTz] = await Promise.all([
      getPopularEvents(),
      getServerTimezone(),
    ]);

    const now = Date.now();
    const upcomingPopular = deduplicateEvents(
      popular.filter(
        (e) =>
          (e.status === "scheduled" ||
            e.status === "upcoming" ||
            e.status === "delayed") &&
          (e.startTime === 0 || e.startTime > now - 10 * 60 * 1000),
      ),
    ).slice(0, 6);

    if (upcomingPopular.length === 0) {
      return (
        <EmptyState
          title="No upcoming popular events scheduled"
          description="Featured and trending upcoming matches will appear here."
        />
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {upcomingPopular.map((e) => (
          <PopularLiveCard
            key={e.id}
            event={e}
            serverTimezone={userTz}
          />
        ))}
      </div>
    );
  } catch {
    return <ErrorState title="Unable to load upcoming popular events" />;
  }
}

async function UpcomingSection() {
  try {
    const [today, all, userTz] = await Promise.all([
      getTodayEvents().catch(() => []),
      getAllEvents().catch(() => []),
      getServerTimezone(),
    ]);

    const now = Date.now();
    const todayUpcoming = deduplicateEvents(
      today.filter(
        (e) =>
          (e.status === "scheduled" ||
            e.status === "upcoming" ||
            e.status === "delayed") &&
          (e.startTime === 0 || e.startTime > now - 10 * 60 * 1000),
      ),
    );

    // Calculate tomorrow date window
    const nowDate = new Date();
    const startOfTomorrow = new Date(nowDate);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(nowDate);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const tomorrowUpcoming = deduplicateEvents(
      all.filter(
        (e) =>
          e.startTime >= startOfTomorrow.getTime() &&
          e.startTime <= endOfTomorrow.getTime() &&
          e.status !== "finished",
      ),
    );

    // Fallback for tomorrow if empty (e.g. later matches from all feed)
    const fallbackTomorrow =
      tomorrowUpcoming.length > 0
        ? tomorrowUpcoming
        : deduplicateEvents(
            all.filter(
              (e) =>
                e.startTime > Date.now() &&
                e.status !== "finished" &&
                !todayUpcoming.some((t) => t.id === e.id),
            ),
          ).slice(0, 8);

    return (
      <UpcomingScheduleSection
        todayEvents={todayUpcoming}
        tomorrowEvents={fallbackTomorrow}
        serverTimezone={userTz}
      />
    );
  } catch {
    return <ErrorState title="Unable to load upcoming schedule" />;
  }
}

async function SportsSection() {
  try {
    const sports = await getSportsWithCounts();
    if (sports.length === 0) {
      return <EmptyState title="Sports are temporarily unavailable" />;
    }
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {sports.map((s) => (
          <SportCard key={s.id} sport={s} />
        ))}
      </div>
    );
  } catch {
    return <ErrorState title="Unable to load sports" />;
  }
}
