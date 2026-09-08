"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { InstallPrompt } from "./InstallPrompt";

export function PwaProvider({ children }: { children?: React.ReactNode }) {
  const [offlineToast, setOfflineToast] = useState<"offline" | "online" | null>(
    null
  );

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for service worker updates
            registration.addEventListener("updatefound", () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.addEventListener("statechange", () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New SW installed, auto-activate
                    installingWorker.postMessage({ type: "SKIP_WAITING" });
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn("[PWA] Service worker registration failed:", err);
          });
      });
    }

    // Network status listeners
    const handleOnline = () => {
      setOfflineToast("online");
      const timer = setTimeout(() => setOfflineToast(null), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setOfflineToast("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {children}

      {/* Connectivity notification banner */}
      {offlineToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {offlineToast === "offline" ? (
            <div className="flex items-center gap-2 rounded-full border border-live-500/40 bg-surface-900/95 px-4 py-1.5 text-xs font-semibold text-live-400 shadow-xl backdrop-blur-md">
              <WifiOff className="h-3.5 w-3.5 animate-pulse" />
              <span>You are offline. Showing cached content.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-brand-500/40 bg-surface-900/95 px-4 py-1.5 text-xs font-semibold text-brand-400 shadow-xl backdrop-blur-md">
              <Wifi className="h-3.5 w-3.5" />
              <span>Back online!</span>
            </div>
          )}
        </div>
      )}

      {/* PWA Install Banner */}
      <InstallPrompt />
    </>
  );
}
