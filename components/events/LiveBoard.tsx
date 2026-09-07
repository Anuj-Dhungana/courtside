"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EventCard } from "@/components/events/EventCard";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { sportLabel } from "@/lib/utils/format";
import type { SportEvent } from "@/types";

const REFRESH_INTERVAL_MS = 30_000;

type SortKey = "relevance" | "time" | "title";

/**
 * Client island for the /live page.
 * Receives server-rendered initial data, then refreshes from the internal
 * /api/live endpoint every 30s (paused while the tab is hidden).
 */
export function LiveBoard({ initialEvents }: { initialEvents: SportEvent[] }) {
  const [events, setEvents] = useState<SportEvent[]>(initialEvents);
  const [refreshError, setRefreshError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [sport, setSport] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("relevance");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { events?: SportEvent[] };
      if (Array.isArray(data.events)) {
        setEvents(data.events);
        setLastUpdated(Date.now());
        setRefreshError(false);
      }
    } catch {
      // Keep showing the last good data; surface a soft warning.
      setRefreshError(true);
    }
  }, []);

  useEffect(() => {
    const start = () => {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        if (document.visibilityState === "visible") void refresh();
      }, REFRESH_INTERVAL_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  const sports = useMemo(() => {
    const ids = Array.from(new Set(events.map((e) => e.sportId))).sort();
    return ids;
  }, [events]);

  const visible = useMemo(() => {
    let list = events;
    if (sport !== "all") list = list.filter((e) => e.sportId === sport);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.home?.name.toLowerCase().includes(q) ||
          e.away?.name.toLowerCase().includes(q),
      );
    }
    if (sort === "time") {
      list = [...list].sort((a, b) => b.startTime - a.startTime);
    } else if (sort === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [events, sport, query, sort]);

  if (initialEvents.length === 0 && events.length === 0 && refreshError) {
    return (
      <ErrorState
        title="Unable to load live events"
        description="Live data is temporarily unavailable. Please try again shortly."
      />
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Filter live events</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by team or event…"
            className="w-full rounded-lg border border-surface-700 bg-surface-900 py-2.5 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-600 focus:border-brand-500/60"
          />
        </label>
        <div className="flex gap-3">
          <label className="flex-1 sm:flex-none">
            <span className="sr-only">Filter by sport</span>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full rounded-lg border border-surface-700 bg-surface-900 px-3 py-2.5 text-sm text-ink-100"
            >
              <option value="all">All sports</option>
              {sports.map((s) => (
                <option key={s} value={s}>
                  {sportLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1 sm:flex-none">
            <span className="sr-only">Sort events</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full rounded-lg border border-surface-700 bg-surface-900 px-3 py-2.5 text-sm text-ink-100"
            >
              <option value="relevance">Most relevant</option>
              <option value="time">Recently started</option>
              <option value="title">A–Z</option>
            </select>
          </label>
        </div>
      </div>

      {/* Status line */}
      <p className="mb-5 text-xs text-ink-600" role="status">
        {refreshError
          ? "Live updates paused — showing last known data."
          : `Auto-refreshing · updated ${new Date(
              lastUpdated,
            ).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}`}
        {" · "}
        {visible.length} event{visible.length === 1 ? "" : "s"}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title={
            events.length === 0
              ? "No live events right now"
              : "No events match your filters"
          }
          description={
            events.length === 0
              ? "This page refreshes automatically — live events will appear here as they start."
              : "Try clearing the search box or choosing a different sport."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
