"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import type { StreamOption, StreamSourceRef } from "@/types";

/** Build the /watch interstitial URL for a stream. */
function watchUrl(
  s: StreamOption,
  meta: {
    eventTitle: string;
    eventId?: string;
    sportId?: string;
    homeTeam?: string;
    awayTeam?: string;
  },
): string {
  const p = new URLSearchParams({
    source: s.source,
    id: s.id,
    streamNo: String(s.streamNo),
    title: meta.eventTitle,
  });
  if (meta.eventId) p.set("eventId", meta.eventId);
  if (meta.sportId) p.set("sport", meta.sportId);
  if (meta.homeTeam) p.set("home", meta.homeTeam);
  if (meta.awayTeam) p.set("away", meta.awayTeam);
  return `/watch?${p.toString()}`;
}

/**
 * Stream information section for an event page.
 *
 * Each stream link opens /watch — a clean, dedicated theater watch page
 * with responsive player controls, stream switching, and direct source access.
 */
export function StreamSection({
  sources,
  eventTitle,
  eventId,
  sportId,
  homeTeam,
  awayTeam,
}: {
  sources: StreamSourceRef[];
  eventTitle: string;
  eventId?: string;
  sportId?: string;
  homeTeam?: string;
  awayTeam?: string;
}) {
  const [streams, setStreams] = useState<StreamOption[] | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    if (sources.length === 0) {
      setStreams([]);
      setState("ready");
      return;
    }
    setState("loading");
    try {
      const results = await Promise.allSettled(
        sources.slice(0, 4).map(async (s) => {
          const res = await fetch(
            `/api/streams/${encodeURIComponent(s.source)}/${encodeURIComponent(s.id)}`,
            { cache: "no-store" },
          );
          if (!res.ok) throw new Error(`status ${res.status}`);
          const data = (await res.json()) as { streams?: StreamOption[] };
          return data.streams ?? [];
        }),
      );
      const merged = results
        .filter(
          (r): r is PromiseFulfilledResult<StreamOption[]> =>
            r.status === "fulfilled",
        )
        .flatMap((r) => r.value);
      if (
        merged.length === 0 &&
        results.every((r) => r.status === "rejected")
      ) {
        setState("error");
        return;
      }
      merged.sort((a, b) => {
        if (a.hd !== b.hd) return a.hd ? -1 : 1;
        return a.streamNo - b.streamNo;
      });
      setStreams(merged);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [sources]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section aria-labelledby="streams-heading" className="mt-10">
      <h2
        id="streams-heading"
        className="mb-1 text-xl font-bold tracking-tight"
      >
        Where to Watch
      </h2>
      <p className="mb-5 text-sm text-ink-500">
        Viewing options reported for this event. Each link opens a branded
        redirect page before taking you to a third-party source.
      </p>

      {state === "loading" ? (
        <div
          role="status"
          aria-label="Loading stream information"
          className="space-y-2"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
          <span className="sr-only">Loading…</span>
        </div>
      ) : state === "error" ? (
        <div
          role="alert"
          className="rounded-xl border border-surface-700/60 bg-surface-900 p-6 text-center"
        >
          <p className="font-medium text-ink-100">
            Streams are currently unavailable.
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 rounded-lg bg-surface-800 px-4 py-2 text-sm font-medium text-ink-100 ring-1 ring-surface-600 transition-colors hover:bg-surface-700"
          >
            Try again
          </button>
        </div>
      ) : (streams?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-6 text-center">
          <p className="font-medium text-ink-100">
            No viewing sources reported for this event yet.
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Sources typically appear closer to the start time.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {streams!.map((s) => (
            <li key={`${s.source}-${s.id}-${s.streamNo}`}>
              <Link
                href={watchUrl(s, {
                  eventTitle,
                  eventId,
                  sportId,
                  homeTeam,
                  awayTeam,
                })}
                className="group flex items-center justify-between gap-4 rounded-xl border border-surface-700/60 bg-surface-900 p-4 transition-all hover:border-brand-500/40 hover:bg-surface-850 hover:shadow-[0_0_20px_rgba(16,185,129,.08)]"
                aria-label={`Open stream ${s.streamNo} in ${s.language} for ${eventTitle} via CourtSide watch page`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-800 text-xs font-bold text-ink-300 ring-1 ring-surface-600 transition-colors group-hover:bg-brand-500/10 group-hover:text-brand-400 group-hover:ring-brand-500/30"
                  >
                    #{s.streamNo}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-100">
                      {s.language} · Source &ldquo;{s.source}&rdquo;
                    </p>
                    <p className="text-xs text-ink-600">
                      CourtSide watch page · third-party redirect
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {s.hd ? <Badge variant="brand">HD</Badge> : null}
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20 transition-all group-hover:bg-brand-500/20 group-hover:ring-brand-500/40">
                    <Play aria-hidden="true" className="h-4 w-4 fill-current ml-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
