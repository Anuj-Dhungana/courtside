"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Info,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface StreamOption {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

interface MatchMeta {
  source: string;
  id: string;
  streamNo: number;
  title: string;
  eventId?: string;
  sport?: string;
  home?: string;
  away?: string;
}

export default function WatchPage() {
  const [params, setParams] = useState<MatchMeta | null>(null);
  const [streams, setStreams] = useState<StreamOption[]>([]);
  const [selectedStream, setSelectedStream] = useState<StreamOption | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [copied, setCopied] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Parse URL search params on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const source = sp.get("source") ?? "";
    const id = sp.get("id") ?? "";
    const streamNo = parseInt(sp.get("streamNo") ?? "1", 10);
    const title = sp.get("title") ?? "Live Sports Event";
    const eventId = sp.get("eventId") ?? undefined;
    const sport = sp.get("sport") ?? undefined;
    const home = sp.get("home") ?? undefined;
    const away = sp.get("away") ?? undefined;

    if (!source && !id && !eventId) {
      setState("error");
      return;
    }

    setParams({ source, id, streamNo, title, eventId, sport, home, away });
  }, []);

  // Fetch streams with automatic multi-source fallback
  const fetchStreams = useCallback(async (p: MatchMeta) => {
    setState("loading");
    try {
      let candidateStreams: StreamOption[] = [];

      // 1. If a specific source and id was requested, try fetching that first
      if (p.source && p.id) {
        try {
          const res = await fetch(
            `/api/streams/${encodeURIComponent(p.source)}/${encodeURIComponent(p.id)}`,
            { cache: "no-store" },
          );
          if (res.ok) {
            const data = (await res.json()) as { streams?: StreamOption[] };
            candidateStreams = data.streams ?? [];
          }
        } catch {
          // ignore, will attempt event fallback below
        }
      }

      // 2. If no streams found, or no source specified, check the event's full source list
      const targetEventId = p.eventId || (p.source ? undefined : p.id);
      if (candidateStreams.length === 0 && targetEventId) {
        try {
          const evRes = await fetch(
            `/api/events/${encodeURIComponent(targetEventId)}`,
            { cache: "no-store" },
          );
          if (evRes.ok) {
            const evData = (await evRes.json()) as {
              event?: {
                title?: string;
                sportId?: string;
                home?: { name: string };
                away?: { name: string };
                sources?: Array<{ source: string; id: string }>;
              };
            };
            const ev = evData.event;
            if (ev) {
              setParams((prev) => ({
                source: prev?.source || ev.sources?.[0]?.source || "",
                id: prev?.id || ev.sources?.[0]?.id || "",
                streamNo: prev?.streamNo || 1,
                title:
                  prev?.title && prev.title !== "Live Sports Event"
                    ? prev.title
                    : ev.title ?? "Live Sports Event",
                eventId: targetEventId,
                sport: prev?.sport || ev.sportId,
                home: prev?.home || ev.home?.name,
                away: prev?.away || ev.away?.name,
              }));

              const otherSources = (ev.sources ?? []).filter(
                (s) => !(s.source === p.source && s.id === p.id),
              );

              if (otherSources.length > 0) {
                const results = await Promise.allSettled(
                  otherSources.slice(0, 5).map(async (s) => {
                    const r = await fetch(
                      `/api/streams/${encodeURIComponent(s.source)}/${encodeURIComponent(s.id)}`,
                      { cache: "no-store" },
                    );
                    if (!r.ok) return [];
                    const d = (await r.json()) as { streams?: StreamOption[] };
                    return d.streams ?? [];
                  }),
                );
                const fetched = results
                  .filter(
                    (r): r is PromiseFulfilledResult<StreamOption[]> =>
                      r.status === "fulfilled",
                  )
                  .flatMap((r) => r.value);

                candidateStreams = [...candidateStreams, ...fetched];
              }
            }
          }
        } catch {
          // fallback failed
        }
      }

      if (candidateStreams.length === 0) {
        setState("error");
        return;
      }

      // Deduplicate streams
      const seen = new Set<string>();
      const uniqueStreams = candidateStreams.filter((s) => {
        const key = `${s.source}-${s.streamNo}-${s.embedUrl}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      uniqueStreams.sort((a, b) => {
        if (a.hd !== b.hd) return a.hd ? -1 : 1;
        return a.streamNo - b.streamNo;
      });

      setStreams(uniqueStreams);
      const initial =
        uniqueStreams.find(
          (s) =>
            s.streamNo === p.streamNo && (!p.source || s.source === p.source),
        ) ?? uniqueStreams[0];
      setSelectedStream(initial);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (params) {
      void fetchStreams(params);
    }
  }, [params, fetchStreams]);


  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      void navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const title = params?.title ?? "Live Sports Event";
  const home = params?.home;
  const away = params?.away;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#07090f] font-sans text-slate-100 antialiased">
      {/* Background Ambient Glow */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          ambientGlow ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-0 top-1/4 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-surface-800/80 bg-surface-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Left: Back & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href={params?.eventId ? `/events/${encodeURIComponent(params.eventId)}` : "/"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-700 bg-surface-800 text-ink-300 transition-colors hover:border-surface-600 hover:text-white"
              title="Return to match details"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M12 3v18M3 12h18"
                  />
                </svg>
              </span>
              <span className="text-sm font-bold tracking-tight">
                Court<span className="text-brand-400">Side</span>
              </span>
            </div>
          </div>

          {/* Right: Ambient Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAmbientGlow((v) => !v)}
              className={`hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all sm:inline-flex ${
                ambientGlow
                  ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
                  : "border-surface-700 bg-surface-900/80 text-ink-500 hover:text-ink-300"
              }`}
              title="Toggle ambient background glow"
            >
              {ambientGlow ? (
                <>
                  <Sun className="h-3.5 w-3.5" />
                  <span>Glow</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dim</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        {state === "loading" ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-3 border-brand-500/20 border-t-brand-400" />
            <h2 className="text-lg font-bold text-ink-100">
              Loading Stream Options…
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Preparing live feed for {title}
            </p>
          </div>
        ) : state === "error" ? (
          <div className="mx-auto max-w-md rounded-2xl border border-surface-700/60 bg-surface-900 p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-ink-100">Stream Currently Unavailable</h2>
            <p className="mt-2 text-sm text-ink-500">
              This feed might not be broadcasting yet or the link has expired. You can head back to the match page to check for alternate sources.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (params) void fetchStreams(params);
                }}
                className="rounded-xl border border-surface-700 bg-surface-800 px-4 py-2 text-sm font-semibold text-ink-100 transition hover:bg-surface-700 hover:text-white"
              >
                Retry
              </button>
              {params?.eventId ? (
                <Link
                  href={`/events/${encodeURIComponent(params.eventId)}`}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-surface-950 transition hover:bg-brand-400"
                >
                  Return to Event
                </Link>
              ) : (
                <Link
                  href="/"
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-surface-950 transition hover:bg-brand-400"
                >
                  Browse Matches
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 8-cols: Video Player & Controls */}
            <div className="flex flex-col gap-4 lg:col-span-8">
              {/* Event Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {title}
                  </h1>
                </div>
              </div>

              {/* Player Box */}
              <div
                ref={playerContainerRef}
                className="group relative overflow-hidden rounded-2xl border border-surface-700/60 bg-surface-950 shadow-2xl transition-colors hover:border-surface-600"
              >
                {/* Top Bar of Player */}
                <div className="flex items-center justify-between border-b border-surface-700/60 bg-surface-900/90 px-4 py-2 text-xs text-ink-500 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-300">
                      Feed #{selectedStream?.streamNo} ({selectedStream?.language})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const ifr = playerContainerRef.current?.querySelector("iframe");
                        if (ifr) ifr.src = ifr.src;
                      }}
                      className="text-ink-500 hover:text-brand-400 transition"
                      title="Reload stream frame"
                    >
                      ↻ Reload
                    </button>
                  </div>
                </div>

                {/* 16:9 Video Frame */}
                <div className="relative aspect-video w-full bg-black">
                  {selectedStream?.embedUrl ? (
                    <iframe
                      src={selectedStream.embedUrl}
                      title={`Live stream for ${title}`}
                      className="h-full w-full border-0"
                      allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write; web-share"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-500 text-sm">
                      No embed URL available
                    </div>
                  )}
                </div>

                {/* Bottom Bar: Multi-stream selector pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-700/60 bg-surface-900/95 px-4 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-ink-500">Available feeds:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {streams.map((s) => {
                        const isActive = s.streamNo === selectedStream?.streamNo;
                        return (
                          <button
                            key={s.streamNo}
                            type="button"
                            onClick={() => setSelectedStream(s)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-brand-500 text-surface-950 shadow-sm"
                                : "border border-surface-700/80 bg-surface-800 text-ink-300 hover:bg-surface-700 hover:text-white"
                            }`}
                          >
                            Stream #{s.streamNo} · {s.language} {s.hd ? "(HD)" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>



              {/* Third-Party Safety Disclaimer */}
              <div className="rounded-xl border border-surface-700/60 bg-surface-900/50 p-4 text-xs text-ink-500">
                <div className="flex items-start gap-2.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <p className="leading-relaxed">
                    <strong className="text-ink-300">Third-Party Stream Advisory:</strong> This video feed is hosted by external independent providers. CourtSide does not host, store, or license streaming media. Please consider watching through official broadcast partners when available.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 4-cols: Match & Channel Information Sidebar */}
            <aside className="flex flex-col gap-4 lg:col-span-4">
              {/* Matchup Card */}
              <div className="rounded-2xl border border-surface-700/60 bg-surface-900 p-5 shadow-xl">
                <div className="border-b border-surface-700/60 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                    Fixture Details
                  </span>
                  <h2 className="mt-1 text-base font-bold text-white">
                    {home && away ? `${home} vs ${away}` : title}
                  </h2>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  {home && away && (
                    <div className="flex items-center justify-between rounded-xl bg-surface-850 p-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink-100">{home}</span>
                        <span className="text-[11px] text-ink-500">Home</span>
                      </div>
                      <span className="font-bold text-brand-400">VS</span>
                      <div className="flex flex-col text-right">
                        <span className="font-semibold text-ink-100">{away}</span>
                        <span className="text-[11px] text-ink-500">Away</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1">
                    <span className="text-ink-500">Sport Category</span>
                    <span className="font-semibold text-ink-300 capitalize">
                      {params?.sport || "Sports"}
                    </span>
                  </div>
                </div>

                {params?.eventId && (
                  <Link
                    href={`/events/${encodeURIComponent(params.eventId)}`}
                    className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-surface-700 bg-surface-800 py-2.5 text-center text-xs font-semibold text-ink-100 transition hover:border-brand-500/40 hover:bg-surface-700"
                  >
                    <span>View Full Match Stats & Info</span>
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {/* All Feeds Channel Switcher Card */}
              <div className="rounded-2xl border border-surface-700/60 bg-surface-900 p-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-surface-700/60 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                    Channel Selector
                  </span>
                  <span className="rounded-full bg-surface-800 px-2 py-0.5 text-[10px] font-bold text-brand-400">
                    {streams.length} Feeds
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {streams.map((s) => {
                    const isCurrent = s.streamNo === selectedStream?.streamNo;
                    return (
                      <button
                        key={s.streamNo}
                        type="button"
                        onClick={() => setSelectedStream(s)}
                        className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                          isCurrent
                            ? "border border-brand-500/50 bg-brand-500/10 text-white"
                            : "border border-surface-700/60 bg-surface-850 text-ink-300 hover:border-surface-600 hover:bg-surface-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                              isCurrent
                                ? "bg-brand-500 text-surface-950"
                                : "bg-surface-700 text-ink-300"
                            }`}
                          >
                            #{s.streamNo}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-ink-100">
                              {s.language} Stream
                            </p>
                            <p className="text-[11px] text-ink-500">
                              {s.hd ? "High Definition" : "Live Stream"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {s.hd && (
                            <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">
                              HD
                            </span>
                          )}
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-xs text-brand-400 font-bold">
                              <Check className="h-3.5 w-3.5" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-surface-700/60">
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-800 py-2.5 text-center text-xs font-semibold text-ink-300 transition hover:bg-surface-700 hover:text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-brand-400" />
                        <span className="text-brand-400">Link Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Stream Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
