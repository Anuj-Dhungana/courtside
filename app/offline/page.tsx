"use client";

import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.href = "/";
      } else {
        setIsChecking(false);
      }
    }, 600);
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center">
      {/* Icon Badge */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-900 ring-1 ring-surface-800">
        <div className="absolute -inset-1 rounded-3xl bg-brand-500/10 blur-md" />
        <WifiOff className="relative h-10 w-10 text-brand-400" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        You are offline
      </h1>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-300">
        CourtSide needs an internet connection to fetch real-time sports scores
        and live streams. Check your Wi-Fi or mobile network and try again.
      </p>

      {/* Online badge if connection returned */}
      {isOnline ? (
        <div className="mt-4 flex items-center gap-2 rounded-full bg-brand-500/10 px-3.5 py-1 text-xs font-semibold text-brand-400 ring-1 ring-brand-500/30">
          <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
          Connection restored!
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleRetry}
          disabled={isChecking}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-surface-950 shadow-lg shadow-brand-500/20 transition-transform hover:bg-brand-400 active:scale-95 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`}
          />
          {isChecking ? "Checking connection..." : "Try Again"}
        </button>
      </div>

      {/* Offline Notice */}
      <div className="mt-12 flex max-w-sm items-start gap-3 rounded-xl border border-surface-800 bg-surface-900/60 p-4 text-left text-xs text-ink-500 backdrop-blur-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
        <div>
          <span className="font-semibold text-ink-300">CourtSide PWA Tip:</span>{" "}
          Previously visited pages and schedule fixtures remain accessible even
          without an active network.
        </div>
      </div>
    </div>
  );
}
