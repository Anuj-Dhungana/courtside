import type { SportEvent } from "@/types";

/** Format a ms timestamp as a short local time, e.g. "6:30 PM". */
export function formatTime(ms: number): string {
  if (!ms) return "TBD";
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Format a ms timestamp as a readable date, e.g. "Sun, 7 Sep". */
export function formatDate(ms: number): string {
  if (!ms) return "Date TBD";
  return new Date(ms).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatDateTime(ms: number): string {
  if (!ms) return "Time TBD";
  return `${formatDate(ms)} · ${formatTime(ms)}`;
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

/** Group events by day bucket label ("Today", "Tomorrow", or a date). */
export function groupEventsByDay(
  events: SportEvent[],
  now = Date.now(),
): { label: string; events: SportEvent[] }[] {
  const startOfDay = (t: number) => {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const today = startOfDay(now);
  const tomorrow = today + 86_400_000;

  const buckets = new Map<string, SportEvent[]>();
  for (const e of events) {
    let label: string;
    if (!e.startTime) label = "Time TBD";
    else {
      const day = startOfDay(e.startTime);
      if (day === today) label = "Today";
      else if (day === tomorrow) label = "Tomorrow";
      else label = formatDate(e.startTime);
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

/** Title-case a sport id like "american-football" -> "American Football". */
export function sportLabel(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
