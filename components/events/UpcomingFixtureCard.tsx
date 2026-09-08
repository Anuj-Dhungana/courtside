import { Info } from "lucide-react";
import Link from "next/link";

import { TeamBadge } from "@/components/ui/TeamBadge";
import { formatTime, relativeLabel, sportLabel } from "@/lib/utils/format";
import type { SportEvent } from "@/types";

export function UpcomingFixtureCard({ event }: { event: SportEvent }) {
  const hasTeams = Boolean(event.home && event.away);
  const timeStr = formatTime(event.startTime);
  const countdownStr = relativeLabel(event.startTime);

  // Extract a league/tournament label or fallback to sport label
  const leagueLabel = getTournamentLabel(event);

  return (
    <Link
      href={`/events/${encodeURIComponent(event.id)}`}
      className="group flex flex-col justify-between rounded-2xl border border-surface-800/80 bg-surface-900/90 p-3.5 transition-all hover:border-surface-700 hover:bg-surface-850/90"
    >
      <div>
        {/* Top: League/Competition & Time Badge */}
        <div className="flex items-center justify-between gap-1.5">
          <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            {leagueLabel}
          </span>
          <span className="shrink-0 rounded-md bg-surface-800/90 px-2 py-0.5 text-[10px] font-bold text-ink-200 ring-1 ring-surface-700/60">
            {timeStr}
          </span>
        </div>

        {/* Teams or Event Title */}
        <div className="mt-3 flex flex-col gap-2">
          {hasTeams ? (
            <>
              <div className="flex items-center gap-2">
                <TeamBadge team={event.home!} size={20} />
                <span className="truncate text-xs font-semibold text-ink-100 group-hover:text-white">
                  {event.home!.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TeamBadge team={event.away!} size={20} />
                <span className="truncate text-xs font-semibold text-ink-100 group-hover:text-white">
                  {event.away!.name}
                </span>
              </div>
            </>
          ) : (
            <p className="line-clamp-2 text-xs font-semibold leading-snug text-ink-100 group-hover:text-white">
              {event.title}
            </p>
          )}
        </div>
      </div>

      {/* Bottom: Countdown pill & Info icon */}
      <div className="mt-3.5 flex items-center justify-between pt-1">
        <span className="rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-0.5 text-[10px] font-medium text-brand-400">
          {countdownStr}
        </span>
        <span
          className="text-ink-500 transition-colors group-hover:text-ink-300"
          title="Match details"
        >
          <Info className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

function getTournamentLabel(event: SportEvent): string {
  // Check if title has something like "UEFA Champions League:" or "Premier League:"
  if (event.title.includes(":")) {
    const prefix = event.title.split(":")[0].trim();
    if (prefix.length < 24) return prefix;
  }
  return sportLabel(event.sportId);
}
