import type { ReactNode } from "react";

const variants = {
  live: "bg-live-500/15 text-live-400 ring-live-500/30",
  upcoming: "bg-sky-500/10 text-sky-300 ring-sky-500/25",
  finished: "bg-surface-700/60 text-ink-500 ring-surface-600/60",
  neutral: "bg-surface-800 text-ink-300 ring-surface-600/60",
  brand: "bg-brand-500/10 text-brand-400 ring-brand-500/25",
} as const;

export type BadgeVariant = keyof typeof variants;

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Live badge with pulsing dot + screen-reader text (not color-only). */
export function LiveBadge({ className = "" }: { className?: string }) {
  return (
    <Badge variant="live" className={className}>
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-live-400 animate-live-pulse"
      />
      <span className="uppercase tracking-wider">Live</span>
      <span className="sr-only">This event is live now</span>
    </Badge>
  );
}
