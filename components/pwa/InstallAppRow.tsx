"use client";

import { CheckCircle2, Download, Share, Smartphone, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppRow() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !/crios|fxios|opios/.test(ua);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setInstalling(false);
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // Already installed
  if (isStandalone) {
    return (
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-800 text-ink-300">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Install App</p>
            <p className="text-xs text-ink-500">Already installed on this device</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-400">
          <CheckCircle2 className="h-4 w-4" />
          Installed
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-800 text-ink-300">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Install App</p>
            <p className="text-xs text-ink-500">
              Add CourtSide to your home screen
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          disabled={installing}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-bold text-surface-950 shadow-md shadow-brand-500/20 transition-all hover:bg-brand-400 active:scale-95 disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          {installing ? "Installing…" : "Install"}
        </button>
      </div>

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-sm rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface-800 text-ink-400 hover:text-white"
              aria-label="Close"
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
                <p className="text-xs text-ink-400">iPhone / iPad</p>
              </div>
            </div>

            <ol className="mt-5 space-y-3 text-xs text-ink-300">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-800 font-semibold text-brand-400">
                  1
                </span>
                <span>
                  Tap the{" "}
                  <strong className="text-white">Share</strong>{" "}
                  <Share className="inline h-3.5 w-3.5 text-brand-400" /> button in
                  Safari&apos;s toolbar.
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
