import Link from "next/link";

import { SportIcon } from "@/components/sports/SportIcon";
import { sportMeta } from "@/lib/utils/sport-meta";
import type { SportWithCounts } from "@/types";

export function SportCard({ sport }: { sport: SportWithCounts }) {
  const meta = sportMeta(sport.id);
  return (
    <Link
      href={`/sports/${encodeURIComponent(sport.id)}`}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-surface-700/60 bg-gradient-to-br ${meta.accent} bg-surface-900 p-5 transition-all hover:border-surface-600 hover:bg-surface-850`}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-ink-200 ring-1 ring-white/10 transition-all group-hover:scale-110 group-hover:bg-white/[0.12] group-hover:text-white">
        <SportIcon sportId={sport.id} className="h-6 w-6" />
      </div>
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
