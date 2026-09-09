import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventGrid } from "@/components/events/EventGrid";
import { StreamSection } from "@/components/player/StreamSection";
import { Badge, LiveBadge } from "@/components/ui/Badge";
import { ClientCountdown, ClientDateTime } from "@/components/ui/ClientTime";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { sportLabel } from "@/lib/utils/format";
import { getEventById, getSportEvents } from "@/server/services/catalog";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(decodeURIComponent(id)).catch(() => null);
  if (!event) {
    return { title: "Event not found" };
  }
  const title =
    event.status === "live" ? `${event.title} — Live Now` : event.title;
  const description = `View information about ${event.title}, including event time, sport and available authorized viewing options.`;
  return {
    title,
    description,
    alternates: { canonical: `/events/${encodeURIComponent(event.id)}` },
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(decodeURIComponent(id)).catch(() => null);
  if (!event) notFound();

  const related = (await getSportEvents(event.sportId).catch(() => []))
    .filter((e) => e.id !== event.id && e.status !== "finished")
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
          <li>
            <Link href="/" className="hover:text-ink-100">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/sports/${encodeURIComponent(event.sportId)}`}
              className="hover:text-ink-100"
            >
              {sportLabel(event.sportId)}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="truncate text-ink-300">
            {event.title}
          </li>
        </ol>
      </nav>

      {/* Match header */}
      <header className="relative overflow-hidden rounded-2xl border border-surface-700/60 bg-gradient-to-br from-surface-850 via-surface-900 to-surface-950 p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl"
        />
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {event.status === "live" ? (
            <LiveBadge />
          ) : event.status === "finished" ? (
            <Badge variant="finished">Finished</Badge>
          ) : event.status === "delayed" ? (
            <Badge variant="delayed">Delayed</Badge>
          ) : event.status === "postponed" ? (
            <Badge variant="postponed">Postponed</Badge>
          ) : event.status === "cancelled" ? (
            <Badge variant="cancelled">Cancelled</Badge>
          ) : event.status === "suspended" ? (
            <Badge variant="suspended">Suspended</Badge>
          ) : event.status === "unknown" ? (
            <Badge variant="unknown">Date TBD</Badge>
          ) : (
            <Badge variant="upcoming">Upcoming</Badge>
          )}
          <Badge variant="neutral">{sportLabel(event.sportId)}</Badge>
          {event.popular ? <Badge variant="brand">Popular</Badge> : null}
        </div>

        {event.home && event.away ? (
          <div className="flex items-start justify-center gap-5 sm:gap-14">
            <TeamColumn team={event.home} />
            <div className="flex flex-col items-center pt-4 sm:pt-6">
              <span className="text-2xl font-black tracking-tight text-ink-500 sm:text-4xl">
                VS
              </span>
            </div>
            <TeamColumn team={event.away} />
          </div>
        ) : (
          <h1 className="text-center text-2xl font-bold tracking-tight sm:text-4xl">
            {event.title}
          </h1>
        )}

        <div className="mt-7 text-center">
          <p className="text-sm font-medium text-ink-300">
            <ClientDateTime ms={event.startTime} />
          </p>
          <p className="mt-1 text-xs text-ink-600">
            {event.status === "live"
              ? "In progress"
              : event.status === "delayed"
                ? "Kickoff delayed · awaiting broadcast"
                : event.status === "postponed"
                  ? "Match postponed"
                  : event.status === "cancelled"
                    ? "Match cancelled"
                    : event.status === "suspended"
                      ? "Match suspended"
                      : event.status === "finished"
                        ? "Match concluded"
                        : (
                          <ClientCountdown ms={event.startTime} />
                        )}
          </p>
        </div>
      </header>

      {/* Hidden h1 for team pages where header uses columns */}
      {event.home && event.away ? (
        <h1 className="sr-only">{event.title}</h1>
      ) : null}

      {/* Streams */}
      <StreamSection
        sources={event.sources}
        eventTitle={event.title}
        eventId={event.id}
        sportId={event.sportId}
        homeTeam={event.home?.name}
        awayTeam={event.away?.name}
        homeBadge={event.home?.badgeUrl}
        awayBadge={event.away?.badgeUrl}
      />

      {/* Related events */}
      {related.length > 0 ? (
        <section aria-label="Related events" className="mt-14">
          <SectionHeading
            title={`More ${sportLabel(event.sportId)}`}
            eyebrow="Related"
            href={`/sports/${encodeURIComponent(event.sportId)}`}
          />
          <EventGrid events={related} />
        </section>
      ) : null}
    </div>
  );
}

function TeamColumn({
  team,
}: {
  team: { name: string; badgeUrl: string | null };
}) {
  return (
    <div className="flex w-28 flex-col items-center gap-3 sm:w-44">
      <TeamBadge team={team} size={80} className="sm:h-24 sm:w-24" />
      <span className="line-clamp-2 text-center text-base font-bold leading-tight sm:text-xl">
        {team.name}
      </span>
    </div>
  );
}
