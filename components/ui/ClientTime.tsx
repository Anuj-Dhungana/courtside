"use client";

import { useEffect, useRef, useState } from "react";

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
  serverTimezone?: string;
}

/**
 * Formats a kickoff timestamp in the user's local browser timezone.
 * Uses both state and a direct DOM ref to guarantee that the text is
 * forcefully and immediately updated to the local browser timezone on mount,
 * bypassing React's suppressHydrationWarning text-diffing bailout.
 */
export function ClientTime({
  ms,
  className,
  fallback,
  serverTimezone,
}: TimeProps) {
  const ref = useRef<HTMLTimeElement>(null);
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (ms) {
      const local = formatTime(ms);
      setFormatted(local);
      if (ref.current) {
        ref.current.textContent = local;
      }
    }
  }, [ms]);

  if (!ms) {
    return <span className={className}>{fallback ?? "TBD"}</span>;
  }

  return (
    <time
      ref={ref}
      dateTime={new Date(ms).toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {formatted ??
        (serverTimezone ? formatTime(ms, serverTimezone) : formatTime(ms))}
    </time>
  );
}

/**
 * Formats a date timestamp in the user's local browser timezone.
 */
export function ClientDate({
  ms,
  className,
  fallback,
  serverTimezone,
}: TimeProps) {
  const ref = useRef<HTMLTimeElement>(null);
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (ms) {
      const local = formatDate(ms);
      setFormatted(local);
      if (ref.current) {
        ref.current.textContent = local;
      }
    }
  }, [ms]);

  if (!ms) {
    return <span className={className}>{fallback ?? "Date TBD"}</span>;
  }

  return (
    <time
      ref={ref}
      dateTime={new Date(ms).toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {formatted ??
        (serverTimezone ? formatDate(ms, serverTimezone) : formatDate(ms))}
    </time>
  );
}

/**
 * Formats full date and time in the user's local browser timezone.
 */
export function ClientDateTime({
  ms,
  className,
  fallback,
  serverTimezone,
}: TimeProps) {
  const ref = useRef<HTMLTimeElement>(null);
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (ms) {
      const local = formatDateTime(ms);
      setFormatted(local);
      if (ref.current) {
        ref.current.textContent = local;
      }
    }
  }, [ms]);

  if (!ms) {
    return <span className={className}>{fallback ?? "Time TBD"}</span>;
  }

  return (
    <time
      ref={ref}
      dateTime={new Date(ms).toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {formatted ??
        (serverTimezone
          ? formatDateTime(ms, serverTimezone)
          : formatDateTime(ms))}
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
  ms?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState<string>(() => (ms ? relativeLabel(ms) : "Time TBD"));

  useEffect(() => {
    if (!ms) return;
    const update = () => {
      const label = relativeLabel(ms);
      setText(label);
      if (ref.current) {
        ref.current.textContent = label;
      }
    };
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [ms]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
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
  startTime?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState<string>(() => (startTime ? getLiveElapsed(startTime) : "In progress"));

  useEffect(() => {
    if (!startTime) return;
    const update = () => {
      const label = getLiveElapsed(startTime);
      setText(label);
      if (ref.current) {
        ref.current.textContent = label;
      }
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {text}
    </span>
  );
}

function getLiveElapsed(startTime?: number): string {
  if (!startTime || startTime <= 0) return "In progress";
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
  event?: SportEvent;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [caption, setCaption] = useState<string>(() => (event ? getTimeCaption(event) : ""));

  useEffect(() => {
    if (!event) return;
    const update = () => {
      const text = getTimeCaption(event);
      setCaption(text);
      if (ref.current) {
        ref.current.textContent = text;
      }
    };
    update();
    if (
      event.status === "live" ||
      event.status === "scheduled" ||
      event.status === "upcoming"
    ) {
      const interval = setInterval(update, 30_000);
      return () => clearInterval(interval);
    }
  }, [event]);

  return (
    <p
      ref={ref}
      className={className ?? "mt-3.5 text-xs text-ink-600"}
      suppressHydrationWarning
    >
      {caption}
    </p>
  );
}

function getTimeCaption(event?: SportEvent): string {
  if (!event) return "";
  if (event.status === "live") {
    if (!event.startTime) return "In progress";
    return `Started ${relativeLabel(event.startTime)}`.replace("in ", "");
  }
  if (event.status === "delayed") return "Kickoff delayed · awaiting broadcast";
  if (event.status === "postponed") return "Fixture postponed";
  if (event.status === "cancelled") return "Fixture cancelled";
  if (event.status === "suspended") return "Match suspended";
  if (event.status === "finished") return "Match concluded";
  if (!event.startTime) return "Kickoff TBD";
  return relativeLabel(event.startTime);
}

/**
 * Retained for backwards compatibility; returns null to hide timezone notice.
 */
export function TimezoneIndicator(_props?: { className?: string }) {
  return null;
}

