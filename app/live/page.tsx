import type { Metadata } from "next";

import { LiveBoard } from "@/components/events/LiveBoard";
import { getLiveEvents } from "@/server/services/catalog";

export const revalidate = 15;

export const metadata: Metadata = {
  title: "Live Now",
  description:
    "All sports events that are live right now — football, basketball, tennis, cricket and more, refreshed automatically.",
  alternates: { canonical: "/live" },
};

export default async function LivePage() {
  const events = await getLiveEvents().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-live-400">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-live-400 animate-live-pulse"
          />
          Live
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Live Now
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-500">
          Everything in play at this moment. This page refreshes automatically
          every 30 seconds.
        </p>
      </header>
      <LiveBoard initialEvents={events} />
    </div>
  );
}
