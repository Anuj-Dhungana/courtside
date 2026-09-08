import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  FileText,
  HelpCircle,
  Info,
  Moon,
  Shield,
  User as UserIcon,
} from "lucide-react";

import { InstallAppRow } from "@/components/pwa/InstallAppRow";

export const metadata: Metadata = {
  title: "User Profile & Settings",
  description: "Manage your CourtSide preferences, stream settings, and app options.",
};

export default function UserPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 rounded-3xl border border-surface-800 bg-surface-900/70 p-5 shadow-xl backdrop-blur-md">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-surface-950 shadow-lg shadow-brand-500/20">
          <UserIcon className="h-8 w-8" />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-950 ring-2 ring-surface-900">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-400" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-white sm:text-xl">
            Sports Fan
          </h1>
        </div>
      </div>

      {/* App Preferences */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-500 px-1">
          Preferences & Experience
        </h2>
        <div className="mt-3 divide-y divide-surface-800/80 rounded-2xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-800 text-ink-300">
                <Moon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Appearance</p>
                <p className="text-xs text-ink-500">Dark mode active</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-400">
              <CheckCircle2 className="h-4 w-4" />
              Obsidian
            </span>
          </div>

          <InstallAppRow />

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-800 text-ink-300">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Match Alerts</p>
                <p className="text-xs text-ink-500">
                  Live kickoff and score notifications
                </p>
              </div>
            </div>
            <span className="text-xs text-ink-400">Browser default</span>
          </div>
        </div>
      </section>

      {/* About & Legal Links */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-500 px-1">
          About CourtSide
        </h2>
        <div className="mt-3 divide-y divide-surface-800/80 rounded-2xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm overflow-hidden">
          <Link
            href="/about"
            className="flex items-center justify-between p-4 transition-colors hover:bg-surface-850"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-800 text-ink-300">
                <Info className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-white">About CourtSide</span>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-500" />
          </Link>

          <Link
            href="/disclaimer"
            className="flex items-center justify-between p-4 transition-colors hover:bg-surface-850"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-800 text-ink-300">
                <HelpCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-white">Disclaimer</span>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-500" />
          </Link>

          <Link
            href="/privacy"
            className="flex items-center justify-between p-4 transition-colors hover:bg-surface-850"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-800 text-ink-300">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-white">Privacy Policy</span>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-500" />
          </Link>

          <Link
            href="/terms"
            className="flex items-center justify-between p-4 transition-colors hover:bg-surface-850"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-800 text-ink-300">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-white">Terms of Service</span>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-500" />
          </Link>
        </div>
      </section>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-ink-500">
        <p>CourtSide v2.4 • Progressive Web App</p>
      </div>
    </div>
  );
}
