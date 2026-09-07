"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live" },
  { href: "/sports", label: "Sports" },
  { href: "/search", label: "Search" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (pathname.startsWith("/watch")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-surface-700/60 bg-surface-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
          aria-label="CourtSide — home"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 ring-1 ring-brand-500/30"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-brand-400"
              fill="currentColor"
            >
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 7.75 6H16.9a5 5 0 0 0-9.8 0H4.25A8 8 0 0 1 12 4Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm-7.75-1h2.85a5 5 0 0 0 3.4 3.9v2.85A8 8 0 0 1 4.25 14Zm9.25 6.75V17.9a5 5 0 0 0 3.4-3.9h2.85a8 8 0 0 1-6.25 6.75Z" />
            </svg>
          </span>
          <span>
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
                  : "text-ink-500 hover:bg-surface-850 hover:text-ink-100"
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

        {/* Mobile menu button */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-300 hover:bg-surface-800 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="border-t border-surface-700/60 bg-surface-950 px-4 pb-4 pt-2 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium ${
                    isActive(item.href)
                      ? "bg-surface-800 text-ink-100"
                      : "text-ink-300 hover:bg-surface-850"
                  }`}
                >
                  {item.label}
                  {item.href === "/live" ? (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-live-400 animate-live-pulse"
                    />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
