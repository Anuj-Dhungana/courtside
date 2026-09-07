import Link from "next/link";

import { sportMeta } from "@/lib/utils/sport-meta";
import type { SportWithCounts } from "@/types";

export function SportCard({ sport }: { sport: SportWithCounts }) {
  const meta = sportMeta(sport.id);
  return (
    <Link
      href={`/sports/${encodeURIComponent(sport.id)}`}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-surface-700/60 bg-gradient-to-br ${meta.accent} bg-surface-900 p-5 transition-all hover:border-surface-600 hover:bg-surface-850`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mb-4 h-8 w-8 text-ink-300 transition-colors group-hover:text-ink-100"
        fill="currentColor"
      >
        <path d={meta.icon} />
      </svg>
      <h3 className="text-base font-semibold text-ink-100">{sport.name}</h3>
      <p className="mt-1 text-xs text-ink-500">
        {sport.liveCount > 0 ? (
          <span className="font-medium text-live-400">
            {sport.liveCount} live now
          </span>
        ) : sport.todayCount > 0 ? (
          `${sport.todayCount} today`
        ) : (
          "View schedule"
        )}
      </p>
    </Link>
  );
}
