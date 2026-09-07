"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
] as const;

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/watch")) {
    return null;
  }

  return (
    <footer className="mt-16 border-t border-surface-700/60 bg-surface-900/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-bold tracking-tight">
              Court<span className="text-brand-400">Side</span>
            </p>
            <p className="mt-1 max-w-sm text-sm text-ink-500">
              Live scores, schedules and event information across the world of
              sport.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-500 transition-colors hover:text-ink-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-8 border-t border-surface-700/40 pt-6">
          <p className="text-xs leading-relaxed text-ink-600">
            CourtSide is an event information aggregator. Event data is provided
            by third-party sources. Any linked or embedded streams are hosted by
            independent third parties; CourtSide does not host, own, or license
            that content and is not responsible for its availability or
            legality. Always prefer official broadcasters where available.
          </p>
          <p className="mt-3 text-xs text-ink-600">
            © {new Date().getFullYear()} CourtSide. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
