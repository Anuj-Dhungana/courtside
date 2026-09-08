"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live" },
  { href: "/sports", label: "Sports" },
  { href: "/search", label: "Search" },
] as const;

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (pathname.startsWith("/watch")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-surface-800/80 bg-surface-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
          aria-label="CourtSide — home"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/20 ring-1 ring-brand-500/40"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-brand-400"
              fill="currentColor"
            >
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 7.75 6H16.9a5 5 0 0 0-9.8 0H4.25A8 8 0 0 1 12 4Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm-7.75-1h2.85a5 5 0 0 0 3.4 3.9v2.85A8 8 0 0 1 4.25 14Zm9.25 6.75V17.9a5 5 0 0 0 3.4-3.9h2.85a8 8 0 0 1-6.25 6.75Z" />
            </svg>
          </span>
          <span className="font-bold tracking-tight text-white">
            Court<span className="text-brand-400">Side</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-surface-800 text-ink-100"
                  : "text-ink-400 hover:bg-surface-850 hover:text-ink-100"
              }`}
            >
              {item.label}
              {item.href === "/live" ? (
                <span
                  aria-hidden="true"
                  className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-live-400 align-middle animate-live-pulse"
                />
              ) : null}
            </Link>
          ))}
        </nav>

        {/* Mobile top bar actions (as in screenshot) */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/live"
            className="flex items-center gap-1.5 rounded-full border border-live-500/30 bg-live-500/10 px-3 py-1 text-xs font-semibold text-live-400 transition-colors hover:bg-live-500/20"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-live-400 animate-live-pulse" />
            <span>Live</span>
          </Link>

          <Link
            href="/search"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-850 text-ink-300 transition-colors hover:bg-surface-800 hover:text-white"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-850 text-ink-300 transition-colors hover:bg-surface-800 hover:text-white"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
