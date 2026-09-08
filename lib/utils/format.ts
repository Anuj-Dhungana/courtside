import type { SportEvent } from "@/types";

/** Format a ms timestamp as a short local time, e.g. "6:30 PM" or "12:30 AM". */
export function formatTime(ms: number, timeZone?: string): string {
  if (!ms) return "TBD";
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  if (timeZone) {
    try {
      options.timeZone = timeZone;
    } catch {
      // ignore invalid timezone
    }
  }
  return new Date(ms).toLocaleTimeString("en-US", options);
}

/** Format a ms timestamp as a readable date, e.g. "Sun, 7 Sep". */
export function formatDate(ms: number, timeZone?: string): string {
  if (!ms) return "Date TBD";
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
  };
  if (timeZone) {
    try {
      options.timeZone = timeZone;
    } catch {
      // ignore invalid timezone
    }
  }
  return new Date(ms).toLocaleDateString("en-GB", options);
}

export function formatDateTime(ms: number, timeZone?: string): string {
  if (!ms) return "Time TBD";
  return `${formatDate(ms, timeZone)} · ${formatTime(ms, timeZone)}`;
}

/** Human-readable relative label: "in 2h 15m", "Started 30m ago". */
export function relativeLabel(ms: number, now = Date.now()): string {
  if (!ms) return "Time TBD";
  const diff = ms - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60_000);
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  const span =
    hours > 24
      ? `${Math.round(hours / 24)}d`
      : hours > 0
        ? `${hours}h ${rem}m`
        : `${mins}m`;
  return diff >= 0 ? `in ${span}` : `${span} ago`;
}

/** Helper to get YYYY-MM-DD for a timestamp in a given timezone */
function getDayKey(ms: number, timeZone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  if (timeZone) {
    try {
      options.timeZone = timeZone;
    } catch {}
  }
  return new Intl.DateTimeFormat("en-CA", options).format(new Date(ms));
}

/** Group events by day bucket label ("Today", "Tomorrow", or a date). */
export function groupEventsByDay(
  events: SportEvent[],
  now = Date.now(),
  timeZone?: string,
): { label: string; events: SportEvent[] }[] {
  const todayKey = getDayKey(now, timeZone);
  const tomorrowKey = getDayKey(now + 86_400_000, timeZone);

  const buckets = new Map<string, SportEvent[]>();
  for (const e of events) {
    let label: string;
    if (!e.startTime) {
      label = "Time TBD";
    } else {
      const eventDayKey = getDayKey(e.startTime, timeZone);
      if (eventDayKey === todayKey) {
        label = "Today";
      } else if (eventDayKey === tomorrowKey) {
        label = "Tomorrow";
      } else {
        label = formatDate(e.startTime, timeZone);
      }
    }
    const list = buckets.get(label) ?? [];
    list.push(e);
    buckets.set(label, list);
  }
  return Array.from(buckets.entries()).map(([label, evts]) => ({
    label,
    events: evts,
  }));
}

/** Safe browser timezone detection */
export function getUserTimezone(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

/** Title-case a sport id like "american-football" -> "American Football". */
export function sportLabel(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
