import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge, LiveBadge } from "@/components/ui/Badge";
import { ClientDateTime } from "@/components/ui/ClientTime";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { sportLabel } from "@/lib/utils/format";
import type { SportEvent } from "@/types";

/** Large featured event banner for the homepage hero. */
export function HeroEvent({ event }: { event: SportEvent }) {
  return (
    <Link
      href={`/events/${encodeURIComponent(event.id)}`}
      className="group relative block overflow-hidden rounded-2xl border border-surface-700/60 bg-gradient-to-br from-surface-850 via-surface-900 to-surface-950 p-6 transition-colors hover:border-brand-500/40 sm:p-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl"
      />
      <div className="mb-6 flex items-center gap-3">
        {event.status === "live" ? (
          <LiveBadge />
        ) : event.status === "delayed" ? (
          <Badge variant="delayed">Delayed</Badge>
        ) : event.status === "finished" ? (
          <Badge variant="finished">Finished</Badge>
        ) : (
          <Badge variant="brand">Featured</Badge>
        )}
        <span className="text-xs font-medium uppercase tracking-widest text-ink-500">
          {sportLabel(event.sportId)}
        </span>
      </div>

      {event.home && event.away ? (
        <div className="flex items-center justify-center gap-6 sm:gap-16">
          <HeroTeam team={event.home} />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black tracking-tight text-ink-500 sm:text-4xl">
              VS
            </span>
          </div>
          <HeroTeam team={event.away} />
        </div>
      ) : (
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink-100 sm:text-4xl">
          {event.title}
        </h2>
      )}

      <p className="mt-6 text-center text-sm text-ink-500">
        <ClientDateTime ms={event.startTime} />
        <span className="ml-2 inline-flex items-center gap-1 font-medium text-brand-400 opacity-0 transition-opacity group-hover:opacity-100">
          <span>View event</span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </span>
      </p>
    </Link>
  );
}

function HeroTeam({
  team,
}: {
  team: { name: string; badgeUrl: string | null };
}) {
  return (
    <div className="flex w-28 flex-col items-center gap-3 sm:w-40">
      <TeamBadge team={team} size={72} className="sm:h-20 sm:w-20" />
      <span className="line-clamp-2 text-center text-sm font-semibold leading-tight text-ink-100 sm:text-base">
        {team.name}
      </span>
    </div>
  );
}
