"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { EventCard } from "@/components/events/EventCard";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { EventGridSkeleton } from "@/components/ui/Skeleton";
import { sportMeta } from "@/lib/utils/sport-meta";
import type { SearchResults } from "@/types";

const DEBOUNCE_MS = 350;

/**
 * Global search experience: debounced input, URL-synced query,
 * loading / empty / error states, keyboard friendly.
 */
export function SearchExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [input, setInput] = useState(initialQ);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">(
    initialQ.trim().length >= 2 ? "loading" : "idle",
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setState("idle");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setState("loading");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as SearchResults;
      setResults(data);
      setState("ready");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState("error");
    }
  }, []);

  // Initial search when arriving with ?q=
  useEffect(() => {
    if (initialQ.trim().length >= 2) void runSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autofocus the search field.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onChange = (value: string) => {
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      const url = trimmed
        ? `/search?q=${encodeURIComponent(trimmed)}`
        : "/search";
      router.replace(url, { scroll: false });
      void runSearch(value);
    }, DEBOUNCE_MS);
  };

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (debounceRef.current) clearTimeout(debounceRef.current);
          void runSearch(input);
        }}
      >
        <label className="relative block">
          <span className="sr-only">Search teams, events and sports</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-600"
          />
          <input
            ref={inputRef}
            type="search"
            value={input}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search teams, events, sports…"
            autoComplete="off"
            className="w-full rounded-xl border border-surface-700 bg-surface-900 py-3.5 pl-12 pr-4 text-base text-ink-100 placeholder:text-ink-600 focus:border-brand-500/60"
          />
        </label>
      </form>

      <div className="mt-8" aria-live="polite">
        {state === "idle" ? (
          <EmptyState
            title="Search the world of sport"
            description="Type at least two characters to search for teams, events and sports."
          />
        ) : state === "loading" ? (
          <EventGridSkeleton count={6} />
        ) : state === "error" ? (
          <ErrorState
            title="Search is temporarily unavailable"
            description="Please try again in a moment."
          />
        ) : results &&
          results.events.length === 0 &&
          results.sports.length === 0 ? (
          <EmptyState
            title={`No results for “${results.query}”`}
            description="Check the spelling, or try a team name like “Lakers” or a sport like “tennis”."
          />
        ) : results ? (
          <div className="space-y-10">
            {results.sports.length > 0 ? (
              <section aria-label="Matching sports">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500">
                  Sports
                </h2>
                <ul className="flex flex-wrap gap-3">
                  {results.sports.map((s) => {
                    const meta = sportMeta(s.id);
                    return (
                      <li key={s.id}>
                        <Link
                          href={`/sports/${encodeURIComponent(s.id)}`}
                          className="flex items-center gap-2.5 rounded-xl border border-surface-700/60 bg-surface-900 px-4 py-2.5 text-sm font-semibold text-ink-100 transition-colors hover:border-surface-600 hover:bg-surface-850"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="h-4.5 w-4.5 text-brand-400"
                            fill="currentColor"
                          >
                            <path d={meta.icon} />
                          </svg>
                          {s.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {results.events.length > 0 ? (
              <section aria-label="Matching events">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500">
                  Events ({results.events.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.events.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
