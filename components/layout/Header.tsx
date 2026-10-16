"use client";

import { Bell, Search, User } from "lucide-react";
import Image from "next/image";
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

  const isIssuesPage = pathname.startsWith("/issues");

  return (
    <header className="sticky top-0 z-50 border-b border-surface-800/80 bg-surface-950/90 backdrop-blur-md">
      {!isIssuesPage ? (
        <div className="border-b border-brand-500/20 bg-brand-500/10 px-4 py-2 text-center text-xs font-medium text-brand-300 sm:px-6">
          Having issues with ads or playback? Try Brave Browser or the uBlock
          Origin extension for a smoother experience. {" "}
          <Link
            href="/issues"
            className="font-bold underline underline-offset-2 hover:text-brand-100"
          >
            Click here
          </Link>
          {" "}for troubleshooting steps.
        </div>
      ) : null}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
          aria-label="CourtSide — home"
        >
          <Image
            src="/issues/logo.png"
            alt=""
            width={44}
            height={32}
            className="h-8 w-11 rounded-xl object-cover"
            priority
          />
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

        {/* Desktop right actions — User avatar */}
        <Link
          href="/user"
          aria-label="User profile"
          aria-current={pathname.startsWith("/user") ? "page" : undefined}
          className={`hidden h-9 w-9 items-center justify-center rounded-full transition-colors md:flex ${
            pathname.startsWith("/user")
              ? "bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/40"
              : "bg-surface-850 text-ink-300 hover:bg-surface-800 hover:text-white"
          }`}
        >
          <User className="h-4 w-4" />
        </Link>

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
