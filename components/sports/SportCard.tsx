import Link from "next/link";

import { SportIcon } from "@/components/sports/SportIcon";
import type { SportWithCounts } from "@/types";

export function SportCard({ sport }: { sport: SportWithCounts }) {
  const isLive = sport.liveCount > 0;

  return (
    <Link
      href={`/sports/${encodeURIComponent(sport.id)}`}
      className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all ${
        isLive
          ? "border-emerald-500/40 bg-emerald-950/20 ring-1 ring-emerald-500/25 hover:border-emerald-400/60 hover:bg-emerald-950/30"
          : "border-surface-800/80 bg-surface-900/90 hover:border-surface-700 hover:bg-surface-850/90"
      }`}
    >
      <div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-ink-200 ring-1 ring-white/10 transition-all group-hover:scale-105 group-hover:bg-white/[0.12] group-hover:text-white">
          <SportIcon sportId={sport.id} className="h-5 w-5" />
        </div>
        <h3 className="mt-2.5 text-sm font-bold text-white transition-colors group-hover:text-brand-300">
          {sport.name}
        </h3>
      </div>

      <div className="mt-2 text-xs">
        {isLive ? (
          <span className="flex items-center gap-1.5 font-semibold text-live-400">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-live-400 animate-live-pulse"
            />
            <span>{sport.liveCount} live now</span>
          </span>
        ) : sport.todayCount > 0 ? (
          <span className="text-ink-400">{sport.todayCount} today</span>
        ) : (
          <span className="text-ink-500">View schedule</span>
        )}
      </div>
    </Link>
  );
}

