import { EventCard } from "./EventCard";
import type { SportEvent } from "@/types";

export function EventGrid({ events }: { events: SportEvent[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}
