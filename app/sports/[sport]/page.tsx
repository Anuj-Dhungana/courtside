import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventGrid } from "@/components/events/EventGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { groupEventsByDay, sportLabel } from "@/lib/utils/format";
import { sportMeta } from "@/lib/utils/sport-meta";
import { getSportEvents, getSports } from "@/server/services/catalog";

export const revalidate = 60;

interface Props {
  params: Promise<{ sport: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  const label = sportLabel(decodeURIComponent(sport));
  return {
    title: `${label} — Live & Upcoming Events`,
    description: `Live ${label.toLowerCase()} events, today's fixtures and recent results. Follow every ${label.toLowerCase()} match on CourtSide.`,
    alternates: { canonical: `/sports/${sport}` },
  };
}

export default async function SportPage({ params }: Props) {
  const { sport: rawSport } = await params;
  const sportId = decodeURIComponent(rawSport);

  // Validate the sport against the API-provided list (dynamic, not hardcoded).
  const sports = await getSports().catch(() => []);
  const sport = sports.find((s) => s.id === sportId);
  if (sports.length > 0 && !sport) notFound();

  const label = sport?.name ?? sportLabel(sportId);
  const meta = sportMeta(sportId);
  const events = await getSportEvents(sportId).catch(() => []);

  const live = events.filter((e) => e.status === "live");
  const upcoming = events.filter((e) => e.status === "upcoming");
  const finished = events.filter((e) => e.status === "finished").slice(0, 9);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-10 flex items-center gap-4">
        <span
          aria-hidden="true"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent} ring-1 ring-surface-600/60`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-ink-100"
            fill="currentColor"
          >
            <path d={meta.icon} />
          </svg>
        </span>
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {label}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {live.length > 0
              ? `${live.length} live · ${upcoming.length} upcoming`
              : `${upcoming.length} upcoming event${upcoming.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </header>

      <section aria-label={`Live ${label} events`} className="mb-12">
        <SectionHeading title="Live" eyebrow="Now" />
        {live.length === 0 ? (
          <EmptyState
            title={`No live ${label.toLowerCase()} right now`}
            description="Upcoming events are listed below."
          />
        ) : (
          <EventGrid events={live} />
        )}
      </section>

      <section aria-label={`Upcoming ${label} events`} className="mb-12">
        <SectionHeading title="Upcoming" eyebrow="Schedule" />
        {upcoming.length === 0 ? (
          <EmptyState title="No upcoming events scheduled" />
        ) : (
          <div className="space-y-8">
            {groupEventsByDay(upcoming).map((g) => (
              <div key={g.label}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">
                  {g.label}
                </h3>
                <EventGrid events={g.events} />
              </div>
            ))}
          </div>
        )}
      </section>

      {finished.length > 0 ? (
        <section aria-label={`Recently finished ${label} events`}>
          <SectionHeading title="Recently Finished" eyebrow="Results" />
          <EventGrid events={finished} />
        </section>
      ) : null}
    </div>
  );
}
