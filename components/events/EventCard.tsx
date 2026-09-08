import Link from "next/link";

import { Badge, LiveBadge } from "@/components/ui/Badge";
import { ClientTime, ClientTimeCaption } from "@/components/ui/ClientTime";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { sportLabel } from "@/lib/utils/format";
import type { SportEvent } from "@/types";

/**
 * Primary event card. Server component with localized client time formatting.
 */
export function EventCard({
  event,
  serverTimezone,
}: {
  event: SportEvent;
  serverTimezone?: string;
}) {
  const hasTeams = Boolean(event.home && event.away);

  return (
    <Link
      href={`/events/${encodeURIComponent(event.id)}`}
      className="group flex flex-col rounded-xl border border-surface-700/60 bg-surface-900 p-4 transition-colors hover:border-surface-600 hover:bg-surface-850"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium uppercase tracking-wider text-ink-500">
          {sportLabel(event.sportId)}
        </span>
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
          <Badge variant="unknown">TBD</Badge>
        ) : (
          <Badge variant="upcoming">
            <ClientTime ms={event.startTime} serverTimezone={serverTimezone} />
          </Badge>
        )}
      </div>

      {hasTeams ? (
        <div className="flex flex-1 flex-col gap-2.5">
          <TeamRow team={event.home!} />
          <TeamRow team={event.away!} />
        </div>
      ) : (
        <p className="flex-1 text-sm font-semibold leading-snug text-ink-100 group-hover:text-white">
          {event.title}
        </p>
      )}

      <ClientTimeCaption event={event} />
    </Link>
  );
}

function TeamRow({
  team,
}: {
  team: { name: string; badgeUrl: string | null };
}) {
  return (
    <div className="flex items-center gap-2.5">
      <TeamBadge team={team} size={28} />
      <span className="truncate text-sm font-medium text-ink-100">
        {team.name}
      </span>
    </div>
  );
}
