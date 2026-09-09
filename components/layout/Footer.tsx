"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/watch")) {
    return null;
  }

  return (
    <footer className="mt-16 border-t border-surface-800/80 bg-surface-950/60 pb-24 pt-10 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white"
            >
              Court<span className="text-brand-400">Side</span>
            </Link>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-ink-400 sm:text-sm">
              {LINKS.map((l, i) => (
                <li key={l.href} className="flex items-center gap-4">
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                  {i < LINKS.length - 1 ? (
                    <span aria-hidden="true" className="text-surface-700">
                      •
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-6 border-t border-surface-850 pt-6">
          <p className="text-xs leading-relaxed text-ink-500">
            Live scores, schedules and event information across the world of
            sport. CourtSide is an event information aggregator. Event data is
            provided by third-party sources. Any linked or embedded streams are
            hosted by independent third parties; CourtSide does not host, own or
            license that content.
          </p>

          <div className="mt-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <p className="text-xs text-ink-500">
              © {new Date().getFullYear()} CourtSide. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

