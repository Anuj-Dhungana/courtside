"use client";

import { Download, Share, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already running in standalone (PWA installed)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Check if dismissed recently
    const dismissedUntil = localStorage.getItem("courtside_pwa_dismissed");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) &&
      !/crios|fxios|opios/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    // If on iOS and not standalone, show after a brief delay
    let timer: NodeJS.Timeout;
    if (isIosDevice) {
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    // Dismiss for 7 days
    localStorage.setItem(
      "courtside_pwa_dismissed",
      String(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Floating PWA Install Bar (Fixed above bottom dock on mobile, bottom-right on desktop) */}
      <div className="fixed bottom-20 left-3 right-3 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 md:bottom-6 md:left-auto md:right-6">
        <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-brand-500/30 bg-surface-900/95 p-3.5 shadow-2xl shadow-black/80 backdrop-blur-xl ring-1 ring-white/10">
          {/* App Icon */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-950 p-1 ring-1 ring-surface-800">
              <Image
                src="/icons/icon-192x192.png"
                alt="CourtSide App Icon"
                width={44}
                height={44}
                className="rounded-lg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-white">CourtSide</p>
                <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-400">
                  App
                </span>
              </div>
              <p className="truncate text-xs text-ink-400">
                Install for fullscreen live matches
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-bold text-surface-950 shadow-md shadow-brand-500/20 transition-all hover:bg-brand-400 active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-sm rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface-800 text-ink-400 hover:text-white"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-950 p-1.5 ring-1 ring-surface-800">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="CourtSide"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Install CourtSide</h3>
                <p className="text-xs text-ink-400">Install on iPhone / iPad</p>
              </div>
            </div>

            <ol className="mt-5 space-y-3 text-xs text-ink-300">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-800 font-semibold text-brand-400">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button{" "}
                  <Share className="inline h-3.5 w-3.5 text-brand-400" /> in Safari’s
                  toolbar.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-800 font-semibold text-brand-400">
                  2
                </span>
                <span>
                  Scroll down and tap{" "}
                  <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-800 font-semibold text-brand-400">
                  3
                </span>
                <span>
                  Tap <strong className="text-white">&ldquo;Add&rdquo;</strong> in the
                  top-right corner.
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-surface-800 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-surface-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
