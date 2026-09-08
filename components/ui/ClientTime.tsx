"use client";

import { useEffect, useState } from "react";

import {
  formatDate,
  formatDateTime,
  formatTime,
  relativeLabel,
} from "@/lib/utils/format";
import type { SportEvent } from "@/types";

interface TimeProps {
  ms: number;
  className?: string;
  fallback?: string;
}

/**
 * Formats a kickoff timestamp in the user's local browser timezone.
 * On server render, falls back to standard format with suppressHydrationWarning.
 * On client mount, instantly reflects the browser's exact timezone (e.g. 12:30 AM for Nepal).
 */
export function ClientTime({ ms, className, fallback }: TimeProps) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (ms) {
      setFormatted(formatTime(ms));
    }
  }, [ms]);

  if (!ms) {
    return <span className={className}>{fallback ?? "TBD"}</span>;
  }

  return (
    <time
      dateTime={new Date(ms).toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {formatted ?? formatTime(ms)}
    </time>
  );
}

/**
 * Formats a date timestamp in the user's local browser timezone.
 */
export function ClientDate({ ms, className, fallback }: TimeProps) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (ms) {
      setFormatted(formatDate(ms));
    }
  }, [ms]);

  if (!ms) {
    return <span className={className}>{fallback ?? "Date TBD"}</span>;
  }

  return (
    <time
      dateTime={new Date(ms).toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {formatted ?? formatDate(ms)}
    </time>
  );
}

/**
 * Formats full date and time in the user's local browser timezone.
 */
export function ClientDateTime({ ms, className, fallback }: TimeProps) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (ms) {
      setFormatted(formatDateTime(ms));
    }
  }, [ms]);

  if (!ms) {
    return <span className={className}>{fallback ?? "Time TBD"}</span>;
  }

  return (
    <time
      dateTime={new Date(ms).toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {formatted ?? formatDateTime(ms)}
    </time>
  );
}

/**
 * Dynamic countdown (e.g. "in 1h 12m", "in 30m") that ticks live on the client.
 */
export function ClientCountdown({
  ms,
  className,
}: {
  ms: number;
  className?: string;
}) {
  const [text, setText] = useState<string>(() => relativeLabel(ms));

  useEffect(() => {
    if (!ms) return;
    setText(relativeLabel(ms));
    const interval = setInterval(() => {
      setText(relativeLabel(ms));
    }, 30_000);
    return () => clearInterval(interval);
  }, [ms]);

  return (
    <span className={className} suppressHydrationWarning>
      {text}
    </span>
  );
}

/**
 * Dynamic elapsed time for live matches (e.g. 15', 1h 20m) ticking live.
 */
export function ClientElapsed({
  startTime,
  className,
}: {
  startTime: number;
  className?: string;
}) {
  const [text, setText] = useState<string>(() => getLiveElapsed(startTime));

  useEffect(() => {
    if (!startTime) return;
    setText(getLiveElapsed(startTime));
    const interval = setInterval(() => {
      setText(getLiveElapsed(startTime));
    }, 60_000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <span className={className} suppressHydrationWarning>
      {text}
    </span>
  );
}

function getLiveElapsed(startTime: number): string {
  if (!startTime) return "In progress";
  const elapsedMs = Date.now() - startTime;
  if (elapsedMs < 0) return "Starting now";
  const mins = Math.floor(elapsedMs / 60_000);
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours > 0) {
    return `${hours}h ${remMins}m`;
  }
  return `${mins}'`;
}

/**
 * Status caption for EventCard with live countdown / elapsed time.
 */
export function ClientTimeCaption({
  event,
  className,
}: {
  event: SportEvent;
  className?: string;
}) {
  const [caption, setCaption] = useState<string>(() => getTimeCaption(event));

  useEffect(() => {
    setCaption(getTimeCaption(event));
    if (
      event.status === "live" ||
      event.status === "scheduled" ||
      event.status === "upcoming"
    ) {
      const interval = setInterval(() => {
        setCaption(getTimeCaption(event));
      }, 30_000);
      return () => clearInterval(interval);
    }
  }, [event]);

  return (
    <p
      className={className ?? "mt-3.5 text-xs text-ink-600"}
      suppressHydrationWarning
    >
      {caption}
    </p>
  );
}

function getTimeCaption(event: SportEvent): string {
  if (event.status === "live") {
    if (!event.startTime) return "In progress";
    return `Started ${relativeLabel(event.startTime)}`.replace("in ", "");
  }
  if (event.status === "delayed") return "Kickoff delayed · awaiting broadcast";
  if (event.status === "postponed") return "Fixture postponed";
  if (event.status === "cancelled") return "Fixture cancelled";
  if (event.status === "suspended") return "Match suspended";
  if (event.status === "finished") return "Match concluded";
  return relativeLabel(event.startTime);
}

/**
 * Shows the user's detected local timezone (e.g. "Times shown in Asia/Kathmandu (UTC+05:45)")
 */
export function TimezoneIndicator({ className }: { className?: string }) {
  const [tzInfo, setTzInfo] = useState<string | null>(null);

  useEffect(() => {
    try {
      const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offsetMinutes = -new Date().getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? "+" : "-";
      const pad = (n: number) =>
        Math.floor(Math.abs(n)).toString().padStart(2, "0");
      const hours = pad(offsetMinutes / 60);
      const mins = pad(offsetMinutes % 60);
      const offsetStr = `UTC${sign}${hours}:${mins}`;
      setTzInfo(`${tzName} (${offsetStr})`);
    } catch {
      // fallback
    }
  }, []);

  if (!tzInfo) return null;

  return (
    <span
      className={
        className ??
        "inline-flex items-center gap-1.5 text-[11px] text-ink-500"
      }
      title="All match times are automatically converted to your local time."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span>All times in {tzInfo}</span>
    </span>
  );
}
