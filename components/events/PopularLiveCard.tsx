import { Clock, Play } from "lucide-react";
import Link from "next/link";

import { ClientElapsed } from "@/components/ui/ClientTime";
import { sportLabel } from "@/lib/utils/format";
import type { SportEvent } from "@/types";

export function PopularLiveCard({ event }: { event: SportEvent }) {
  const hasTeams = Boolean(event.home && event.away);
  const title = hasTeams
    ? `${event.home!.name} vs ${event.away!.name}`
    : event.title;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-surface-800/80 bg-surface-900/90 p-3.5 transition-all hover:border-surface-700 hover:bg-surface-850/90">
      <div>
        {/* Top: Sport & Live Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-wider text-ink-400">
            {sportLabel(event.sportId)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-live-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-live-400 ring-1 ring-live-500/30">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-live-400 animate-live-pulse"
            />
            Live
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/events/${encodeURIComponent(event.id)}`}
          className="mt-2 block"
        >
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-brand-300">
            {title}
          </h3>
        </Link>

        {/* Elapsed / Timing */}
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-ink-400">
          <Clock className="h-3 w-3 text-ink-500" />
          <ClientElapsed startTime={event.startTime} />
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-3.5 pt-1">
        <Link
          href={
            event.sources && event.sources.length > 0
              ? `/watch?eventId=${encodeURIComponent(event.id)}&source=${encodeURIComponent(event.sources[0].source)}&id=${encodeURIComponent(event.sources[0].id)}&title=${encodeURIComponent(title)}`
              : `/events/${encodeURIComponent(event.id)}`
          }
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-400 py-2 text-center text-xs font-bold text-surface-950 shadow-sm shadow-emerald-500/20 transition-all hover:bg-emerald-300 active:scale-[0.98]"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Watch</span>
        </Link>
      </div>
    </div>
  );
}
