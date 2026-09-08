"use client";

import { useState } from "react";

import { UpcomingFixtureCard } from "@/components/events/UpcomingFixtureCard";
import { TimezoneIndicator } from "@/components/ui/ClientTime";
import { EmptyState } from "@/components/ui/EmptyState";
import type { SportEvent } from "@/types";

export function UpcomingScheduleSection({
  todayEvents,
  tomorrowEvents,
  serverTimezone,
}: {
  todayEvents: SportEvent[];
  tomorrowEvents: SportEvent[];
  serverTimezone?: string;
}) {
  const [tab, setTab] = useState<"today" | "tomorrow">("today");

  const events = tab === "today" ? todayEvents : tomorrowEvents;

  return (
    <div>
      {/* Section Header with Segmented Control */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-400">
            Schedule
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {tab === "today" ? "Upcoming Today" : "Upcoming Tomorrow"}
            </h2>
            <TimezoneIndicator />
          </div>
        </div>

        {/* TODAY / TOMORROW toggle buttons */}
        <div className="flex items-center rounded-lg bg-surface-900 p-1 ring-1 ring-surface-800">
          <button
            type="button"
            onClick={() => setTab("today")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              tab === "today"
                ? "bg-emerald-400 text-surface-950 shadow-sm"
                : "text-ink-400 hover:text-white"
            }`}
          >
            TODAY
          </button>
          <button
            type="button"
            onClick={() => setTab("tomorrow")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              tab === "tomorrow"
                ? "bg-emerald-400 text-surface-950 shadow-sm"
                : "text-ink-400 hover:text-white"
            }`}
          >
            TOMORROW
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <EmptyState
          title={`No upcoming events for ${tab}`}
          description="Check back soon or browse sports for future fixtures."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {events.slice(0, 8).map((event) => (
            <UpcomingFixtureCard
              key={event.id}
              event={event}
              serverTimezone={serverTimezone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
