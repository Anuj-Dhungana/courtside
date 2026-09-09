"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ClientTime } from "@/components/ui/ClientTime";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { sportLabel } from "@/lib/utils/format";
import type { SportEvent } from "@/types";

export function PopularLiveCard({
  event,
  serverTimezone,
}: {
  event: SportEvent;
  serverTimezone?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasTeams = Boolean(event.home && event.away);
  const title = hasTeams
    ? `${event.home!.name} vs ${event.away!.name}`
    : event.title;

  const watchParams = new URLSearchParams({
    eventId: event.id,
    title,
    sport: event.sportId,
  });
  if (event.sources && event.sources.length > 0) {
    watchParams.set("source", event.sources[0].source);
    watchParams.set("id", event.sources[0].id);
  }
  if (event.home) watchParams.set("home", event.home.name);
  if (event.away) watchParams.set("away", event.away.name);
  if (event.home?.badgeUrl) watchParams.set("homeBadge", event.home.badgeUrl);
  if (event.away?.badgeUrl) watchParams.set("awayBadge", event.away.badgeUrl);

  const watchHref =
    event.sources && event.sources.length > 0
      ? `/watch?${watchParams.toString()}`
      : `/events/${encodeURIComponent(event.id)}`;

  const showPoster = Boolean(event.posterUrl) && !imgFailed;

  return (
    <div className="group relative flex flex-col transition-all">
      {/* 16:9 Banner Thumbnail Box */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-950 border border-surface-800/80 shadow-md transition-all duration-300 group-hover:border-surface-700 group-hover:shadow-xl group-hover:shadow-black/40">
        {/* Top Badges / Star Overlay */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-2 sm:p-2.5 pointer-events-none">
          {/* Time or Live pill */}
          <div className="pointer-events-auto">
            {event.status === "live" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md ring-1 ring-white/10 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-live-500 animate-live-pulse" />
                Live
              </span>
            ) : event.startTime > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-white backdrop-blur-md ring-1 ring-white/10 shadow-sm">
                <ClientTime ms={event.startTime} serverTimezone={serverTimezone} />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-white backdrop-blur-md ring-1 ring-white/10 shadow-sm">
                TBD
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <div className="pointer-events-auto">
            <FavoriteButton eventId={event.id} title={title} />
          </div>
        </div>

        {/* Clickable Banner Area Linking to Watch */}
        <Link
          href={watchHref}
          className="absolute inset-0 z-10 block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label={`Watch ${title}`}
        >
          {showPoster ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={event.posterUrl!}
              alt={title}
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            /* Synthetic Stadium Banner Fallback */
            <div className="relative flex h-full w-full items-center justify-between overflow-hidden bg-gradient-to-r from-[#0b1329] via-[#111f44] to-[#0b1329] px-4 sm:px-6">
              <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-blue-600/15 blur-2xl pointer-events-none" />
              <div className="absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-indigo-600/15 blur-2xl pointer-events-none" />

              {hasTeams ? (
                <>
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <TeamBadge team={event.home!} size={46} className="shadow-lg" />
                    <span className="max-w-[70px] sm:max-w-[90px] truncate text-[10px] sm:text-xs font-semibold text-ink-200 text-center">
                      {event.home!.name}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center z-10">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
                      <Trophy className="h-4 w-4 text-brand-300" />
                    </div>
                    <span className="mt-1 text-[9px] font-black uppercase tracking-widest text-ink-400">
                      VS
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <TeamBadge team={event.away!} size={46} className="shadow-lg" />
                    <span className="max-w-[70px] sm:max-w-[90px] truncate text-[10px] sm:text-xs font-semibold text-ink-200 text-center">
                      {event.away!.name}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex w-full items-center justify-center p-4 text-center z-10">
                  <p className="line-clamp-2 text-xs sm:text-sm font-bold text-ink-100">
                    {title}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom subtle shadow vignette */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </Link>
      </div>

      {/* Info below Banner (Title & Sport Category) */}
      <div className="mt-2.5 px-0.5">
        <Link href={watchHref} className="block">
          <h3 className="line-clamp-2 text-sm sm:text-base font-bold leading-snug text-white transition-colors group-hover:text-brand-300">
            {title}
          </h3>
        </Link>
        <p className="mt-1 text-xs font-semibold capitalize tracking-wide text-ink-400">
          {sportLabel(event.sportId)}
        </p>
      </div>
    </div>
  );
}
