"use client";

import { Calendar, Home, LayoutGrid, Radio, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/live", label: "Live", icon: Radio, hasLiveDot: true },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/sports", label: "Sports", icon: LayoutGrid },
  { href: "/search", label: "Search", icon: Search },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  // Do not show bottom nav on player page
  if (pathname.startsWith("/watch")) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Mobile navigation bar"
      className="fixed bottom-0 inset-x-0 z-50 flex h-16 items-center justify-around border-t border-surface-800/80 bg-surface-950/95 px-2 backdrop-blur-xl md:hidden safe-area-pb"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon, ...item }) => {
        const active = isActive(href);
        const hasLiveDot = "hasLiveDot" in item && item.hasLiveDot;

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex flex-1 flex-col items-center justify-center py-1 text-center transition-colors ${
              active
                ? "text-brand-400"
                : "text-ink-500 hover:text-ink-200"
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Icon
                className={`h-5 w-5 transition-transform duration-150 ${
                  active ? "scale-110" : "group-hover:scale-105"
                }`}
                strokeWidth={active ? 2.3 : 1.8}
              />
              {hasLiveDot ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-live-400 ring-2 ring-surface-950 animate-live-pulse"
                />
              ) : null}
            </div>
            <span
              className={`mt-1 text-[10px] tracking-tight ${
                active ? "font-bold text-brand-400" : "font-medium"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
